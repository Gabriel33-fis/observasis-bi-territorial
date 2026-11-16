"""Extrai a mortalidade infantil e a mortalidade até 5 anos por UF da planilha oficial do IBGE.

Fonte: IBGE, Projeções da População: Brasil e Unidades da Federação - Revisão 2024,
tabela "Indicadores Implícitos" (dados_ibge/projecoes_2024_tab4_indicadores.xlsx).
Gera o arquivo ref_mortalidade_infantil_uf.json, lido pelo processar_bi.py.

Indicadores (ambos os sexos, por mil nascidos vivos):
- TMI_T: taxa de mortalidade infantil (óbitos de menores de 1 ano)
- 5q0_T: probabilidade de morte até os 5 anos de idade

Também guarda NASC_T (nascimentos totais no ano), usado pelo processar_bi.py como
denominador da taxa de óbitos por DRSAI em menores de 5 anos.

Requer: pip install pandas openpyxl
"""
import json
import pandas as pd

ANO = 2021
PLANILHA = "dados_ibge/projecoes_2024_tab4_indicadores.xlsx"
SAIDA = "ref_mortalidade_infantil_uf.json"
COLUNAS = {"TMI_T": "mortalidade_infantil", "5q0_T": "mortalidade_ate_5_anos", "NASC_T": "nascidos_vivos"}

print(f"--- Extraindo mortalidade infantil (TMI_T) e até 5 anos (5q0_T) - IBGE {ANO} ---")

# O cabeçalho com os nomes das colunas (ANO, CÓD., SIGLA, LOCAL, ..., TMI_T, 5q0_T) está na 7ª linha
df = pd.read_excel(PLANILHA, sheet_name=0, header=6)
df = df.dropna(subset=["ANO", "CÓD."])
df["ANO"] = df["ANO"].astype(int)
df["CÓD."] = df["CÓD."].astype(int)

df_ano = df[df["ANO"] == ANO]
# Códigos 11 a 53 são as Unidades da Federação; 0 é o Brasil e 1 a 5 são as Grandes Regiões
df_uf = df_ano[df_ano["CÓD."].between(11, 53)].sort_values("SIGLA")
if len(df_uf) != 27:
    raise ValueError(f"Esperadas 27 UFs, encontradas {len(df_uf)}.")

linha_br = df_ano[df_ano["CÓD."] == 0].iloc[0]


def formatar(nome, valor):
    """Nascidos vivos é contagem (inteiro); as taxas ficam com duas casas decimais."""
    return int(round(float(valor))) if nome == "nascidos_vivos" else round(float(valor), 2)


referencia = {
    "ano": ANO,
    "unidade": "taxas por mil nascidos vivos, ambos os sexos; nascidos_vivos em número absoluto",
    "fonte": "IBGE, Projeções da População: Brasil e Unidades da Federação - Revisão 2024 (Indicadores Implícitos)",
    "arquivo": PLANILHA,
    "brasil": {nome: formatar(nome, linha_br[col]) for col, nome in COLUNAS.items()},
    "valores": {
        linha["SIGLA"]: {nome: formatar(nome, linha[col]) for col, nome in COLUNAS.items()}
        for _, linha in df_uf.iterrows()
    },
}

with open(SAIDA, "w", encoding="utf-8") as f:
    json.dump(referencia, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"Sucesso! '{SAIDA}' gerado com {len(referencia['valores'])} UFs (Brasil: {referencia['brasil']}).")
