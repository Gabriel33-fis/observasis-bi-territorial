import pandas as pd
import numpy as np

print("--- 1. Carregando dados brutos ---")
df_pib = pd.read_csv("fato_pib.csv")
df_pop = pd.read_csv("fato_populacao.csv")
df_snis = pd.read_csv("fato_snis.csv")
df_sim = pd.read_csv("fato_sim.csv")
df_sinan = pd.read_csv("fato_sinan.csv")

# Função robusta para limpar e padronizar o id_municipio para 6 dígitos
def padronizar_ibge(df, col='id_municipio'):
    df = df.dropna(subset=[col]).copy()
    df[col] = df[col].astype(str).str.strip()
    df = df[~df[col].isin(['nan', 'None', '', '0', '0.0', 'None.0'])]
    df[col] = df[col].str.split('.').str[0].str[:6]
    df = df[df[col].str.isnumeric() & (df[col].str.len() == 6)]
    df[col] = df[col].astype(int)
    return df

print("--- 2. Limpeza e modelagem das chaves ---")
df_pib = padronizar_ibge(df_pib)
df_pop = padronizar_ibge(df_pop)
df_snis = padronizar_ibge(df_snis)
df_sim = padronizar_ibge(df_sim)
df_sinan = padronizar_ibge(df_sinan)

# 2.1 Criar a Tabela Dimensão: dLocalidade
df_dlocalidade = df_pop[['id_municipio', 'populacao']].drop_duplicates(subset=['id_municipio']).copy()

mapa_uf = {
    11: ("RO", "Norte"), 12: ("AC", "Norte"), 13: ("AM", "Norte"), 14: ("RR", "Norte"),
    15: ("PA", "Norte"), 16: ("AP", "Norte"), 17: ("TO", "Norte"),
    21: ("MA", "Nordeste"), 22: ("PI", "Nordeste"), 23: ("CE", "Nordeste"), 24: ("RN", "Nordeste"),
    25: ("PB", "Nordeste"), 26: ("PE", "Nordeste"), 27: ("AL", "Nordeste"), 28: ("SE", "Nordeste"),
    29: ("BA", "Nordeste"),
    31: ("MG", "Sudeste"), 32: ("ES", "Sudeste"), 33: ("RJ", "Sudeste"), 35: ("SP", "Sudeste"),
    41: ("PR", "Sul"), 42: ("SC", "Sul"), 43: ("RS", "Sul"),
    50: ("MS", "Centro-Oeste"), 51: ("MT", "Centro-Oeste"), 52: ("GO", "Centro-Oeste"), 53: ("DF", "Centro-Oeste")
}

df_dlocalidade['cod_uf'] = df_dlocalidade['id_municipio'].astype(str).str[:2].astype(int)
df_dlocalidade['uf'] = df_dlocalidade['cod_uf'].map(lambda x: mapa_uf.get(x, ("Outro", "Outro"))[0])
df_dlocalidade['regiao'] = df_dlocalidade['cod_uf'].map(lambda x: mapa_uf.get(x, ("Outro", "Outro"))[1])

df_dlocalidade.to_csv("dim_localidade.csv", index=False)
print(f"Dimensão dLocalidade criada: {len(df_dlocalidade)} municípios.")

# 2.2 Tratamento das Tabelas Fato
df_pib = df_pib.merge(df_dlocalidade[['id_municipio', 'populacao']], on='id_municipio', how='left')
df_pib['pib_per_capita'] = np.where(df_pib['populacao'] > 0, df_pib['pib'] / df_pib['populacao'], np.nan)
df_pib[['id_municipio', 'ano', 'pib', 'pib_per_capita']].to_csv("fato_pib_limpa.csv", index=False)

df_snis['agua_pct'] = pd.to_numeric(df_snis['agua_pct'], errors='coerce').fillna(0).clip(0, 100)
df_snis['esgoto_pct'] = pd.to_numeric(df_snis['esgoto_pct'], errors='coerce').fillna(0).clip(0, 100)
df_snis[['id_municipio', 'ano', 'agua_pct', 'esgoto_pct']].to_csv("fato_snis_limpa.csv", index=False)

print("--- 3. Cruzamento relacional (Star Schema -> Base Consolidada) ---")
df_master = df_dlocalidade.merge(df_pib[['id_municipio', 'pib', 'pib_per_capita']], on='id_municipio', how='left')
df_master = df_master.merge(df_snis[['id_municipio', 'agua_pct', 'esgoto_pct']], on='id_municipio', how='left')
df_master = df_master.merge(df_sim[['id_municipio', 'total_obitos']], on='id_municipio', how='left')
df_master = df_master.merge(df_sinan[['id_municipio', 'total_notificacoes']], on='id_municipio', how='left')

# Preenchimento de métricas ausentes
df_master['total_obitos'] = df_master['total_obitos'].fillna(0)
df_master['total_notificacoes'] = df_master['total_notificacoes'].fillna(0)
df_master['agua_pct'] = df_master['agua_pct'].fillna(0)
df_master['esgoto_pct'] = df_master['esgoto_pct'].fillna(0)
df_master['pib'] = df_master['pib'].fillna(0)
df_master['pib_per_capita'] = df_master['pib_per_capita'].fillna(0)

df_master['taxa_obitos_100k'] = np.where(
    df_master['populacao'] > 0,
    (df_master['total_obitos'] / df_master['populacao']) * 100000,
    0
)
df_master['taxa_notificacoes_100k'] = np.where(
    df_master['populacao'] > 0,
    (df_master['total_notificacoes'] / df_master['populacao']) * 100000,
    0
)

print("--- 4. Minerando Outliers e Índice Sintético ---")
# Evitar divisão por zero isolando o máximo
max_obitos = df_master['taxa_obitos_100k'].max() if df_master['taxa_obitos_100k'].max() > 0 else 1
max_pib = df_master['pib_per_capita'].max() if df_master['pib_per_capita'].max() > 0 else 1

df_master['score_falta_esgoto'] = 100 - df_master['esgoto_pct']
df_master['score_mortalidade'] = (df_master['taxa_obitos_100k'] / max_obitos) * 100
df_master['score_pobreza'] = (1 - (df_master['pib_per_capita'] / max_pib)) * 100

# Cálculo do Índice com Pesos (40% Esgoto, 40% Mortalidade, 20% Pobreza)
df_master['indice_vulnerabilidade'] = (
    (df_master['score_falta_esgoto'] * 0.4) + 
    (df_master['score_mortalidade'] * 0.4) + 
    (df_master['score_pobreza'] * 0.2)
).round(2)

# Exporta a base consolidada municipal JÁ com o Índice Sintético calculado
df_master.to_csv("base_consolidada_municipios.csv", index=False)
print("Base analítica municipal guardada em 'base_consolidada_municipios.csv'!")

# Identificando Outliers Positivos de Gestão
pib_q25 = df_master['pib_per_capita'].quantile(0.25)
outliers_gestao = df_master[(df_master['pib_per_capita'] <= pib_q25) & (df_master['esgoto_pct'] >= 90)]
print(f"Identificados {len(outliers_gestao)} municípios considerados Outliers de Gestão Pública Eficiente.")
outliers_gestao[['id_municipio', 'uf', 'pib_per_capita', 'esgoto_pct']].to_csv("outliers_gestao_eficiente.csv", index=False)


print("--- 5. Agregação por UF para o Dashboard Web ---")
# Agrupamento por estado calculando somas e médias ponderadas
def agregar_uf(grupo):
    pop = grupo['populacao'].sum()
    pib_tot = grupo['pib'].sum()
    pib_cap = (pib_tot / pop) if pop > 0 else 0
    esgoto = ((grupo['esgoto_pct'] * grupo['populacao']).sum() / pop) if pop > 0 else 0
    agua = ((grupo['agua_pct'] * grupo['populacao']).sum() / pop) if pop > 0 else 0
    obitos = grupo['total_obitos'].sum()
    notif = grupo['total_notificacoes'].sum()
    
    # Média ponderada do índice de vulnerabilidade para o estado
    vuln_media = ((grupo['indice_vulnerabilidade'] * grupo['populacao']).sum() / pop) if pop > 0 else 0
    
    return pd.Series({
        'populacao': int(pop),
        'pib_total': float(pib_tot),
        'pib_per_capita': float(round(pib_cap, 2)),
        'coleta_esgoto_pct': float(round(esgoto, 2)),
        'atendimento_agua_pct': float(round(agua, 2)),
        'total_obitos': int(obitos),
        'total_notificacoes': int(notif),
        'taxa_mortalidade_100k': float(round((obitos / pop * 100000), 2)) if pop > 0 else 0,
        'taxa_sinan_100k': float(round((notif / pop * 100000), 2)) if pop > 0 else 0,
        'indice_vulnerabilidade': float(round(vuln_media, 2))
    })

df_uf = df_master.groupby(['uf', 'regiao'], as_index=False).apply(agregar_uf, include_groups=False).reset_index()

# Remover linhas residuais sem sigla de estado válida
df_uf = df_uf[df_uf['uf'] != 'Outro']

# Exportar JSON formatado consumido pelo React
df_uf.to_json("dados_estados_dashboard.json", orient="records", indent=2, force_ascii=False)
print(f"Sucesso! 'dados_estados_dashboard.json' gerado com {len(df_uf)} UFs.")

import requests

print("--- 6. Buscando Nomes no IBGE e Exportando JSON Municipal ---")
# Busca nomes na API pública do IBGE
url = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
resp = requests.get(url)

if resp.status_code == 200:
    ibge_data = resp.json()
    # Extrai id de 6 dígitos e nome
    df_nomes = pd.DataFrame([{
        'id_municipio': int(str(m['id'])[:6]),
        'nome_municipio': m['nome']
    } for m in ibge_data])
    
    # Mescla os nomes na base consolidada
    df_master = df_master.merge(df_nomes, on='id_municipio', how='left')
    df_master['nome_municipio'] = df_master['nome_municipio'].fillna("Desconhecido")
else:
    print("Aviso: Falha ao acessar API do IBGE. Nomes ficarão em branco.")
    df_master['nome_municipio'] = "Indisponível"

# Exporta o JSON leve para o frontend em React
df_master.to_json("dados_municipios_dashboard.json", orient="records", indent=2, force_ascii=False)
print("Sucesso! 'dados_municipios_dashboard.json' gerado para o React.")

