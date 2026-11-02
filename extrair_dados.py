import basedosdados as bd
import pandas as pd

PROJECT_ID = "serious-hold-476711-r6"

# 1. Dimensão Município / População (Essencial para calcular taxas por 100 mil hab)
print("\n--- 1/4 Extraindo População e Território (IBGE) ---")
query_pop = """
SELECT 
    id_municipio,
    ano,
    populacao
FROM `basedosdados.br_ibge_populacao.municipio`
WHERE ano = 2021
"""
df_pop = bd.read_sql(query_pop, billing_project_id=PROJECT_ID)
df_pop.to_csv("fato_populacao.csv", index=False)
print(f"População salva: {len(df_pop)} linhas.")


# 2. Saneamento - SNIS (com os nomes de colunas oficiais da Base dos Dados)
print("\n--- 2/4 Extraindo Saneamento - Água e Esgoto (SNIS) ---")
query_snis = """
SELECT 
    id_municipio,
    ano,
    indice_atendimento_total_agua AS agua_pct,
    indice_coleta_esgoto AS esgoto_pct
FROM `basedosdados.br_mdr_snis.municipio_agua_esgoto`
WHERE ano = 2021
"""
df_snis = bd.read_sql(query_snis, billing_project_id=PROJECT_ID)
df_snis.to_csv("fato_snis.csv", index=False)
print(f"SNIS salvo com sucesso: {len(df_snis)} linhas.")


# 3. Mortalidade - SIM (Agrupado por município de residência)
print("\n--- 3/4 Extraindo Agregado de Mortalidade (SIM) ---")
query_sim = """
SELECT 
    id_municipio_residencia AS id_municipio,
    ano,
    COUNT(1) AS total_obitos
FROM `basedosdados.br_ms_sim.microdados`
WHERE ano = 2021
GROUP BY id_municipio, ano
"""
df_sim = bd.read_sql(query_sim, billing_project_id=PROJECT_ID)
df_sim.to_csv("fato_sim.csv", index=False)
print(f"SIM salvo com sucesso: {len(df_sim)} linhas.")


# 4. Agravos / Vigilância Epidemiológica (SINAN)
# Nota: na Base dos Dados, a tabela consolidada de notificação é microdados_violencia ou microdados_dengue
print("\n--- 4/4 Extraindo Notificações de Dengue (SINAN) ---")
try:
    query_sinan = """
    SELECT 
        id_municipio_notificacao AS id_municipio,
        ano,
        COUNT(1) AS total_notificacoes
    FROM `basedosdados.br_ms_sinan.microdados_dengue`
    WHERE ano = 2021
    GROUP BY id_municipio, ano
    """
    df_sinan = bd.read_sql(query_sinan, billing_project_id=PROJECT_ID)
    df_sinan.to_csv("fato_sinan.csv", index=False)
    print(f"SINAN salvo com sucesso: {len(df_sinan)} linhas.")
except Exception as e:
    print(f"Aviso ao consultar SINAN: {e}")

print("\nProcesso concluído!")