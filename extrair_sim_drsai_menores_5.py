"""Extrai os óbitos por DRSAI (CID-10 A00 a A09) de crianças menores de 5 anos - SIM 2021.

É o desfecho mais específico para a hipótese do projeto: restringe a causa
(doenças relacionadas ao saneamento ambiental inadequado) e a faixa etária
mais vulnerável a elas. Gera o arquivo fato_sim_menores_5.csv, que o
processar_bi.py lê quando existe.

Requer: pip install basedosdados pandas
"""
import basedosdados as bd
import pandas as pd

PROJECT_ID = "serious-hold-476711-r6"
ANO = 2021
TABELA = "basedosdados.br_ms_sim.microdados"
SAIDA = "fato_sim_menores_5.csv"

print(f"--- Extraindo Óbitos por DRSAI (CID A00-A09) em Menores de 5 Anos - SIM {ANO} ---")

# 1. Confere se a tabela tem as colunas usadas na consulta antes de gastar cota do BigQuery
query_colunas = """
SELECT column_name
FROM `basedosdados.br_ms_sim.INFORMATION_SCHEMA.COLUMNS`
WHERE table_name = 'microdados'
"""
colunas = set(bd.read_sql(query_colunas, billing_project_id=PROJECT_ID)["column_name"])
necessarias = {"ano", "id_municipio_residencia", "causa_basica", "idade"}
faltando = necessarias - colunas
if faltando:
    raise SystemExit(
        f"A tabela {TABELA} não tem a(s) coluna(s) {sorted(faltando)}. "
        f"Colunas com 'idade' ou 'nasc' no nome: "
        f"{sorted(c for c in colunas if 'idade' in c or 'nasc' in c)}. "
        "Ajuste o filtro de idade da consulta abaixo."
    )

# 2. Mesmo filtro de causa do extrair_sim_drsai.py, restrito a idade < 5 anos.
#    Na Base dos Dados, a coluna idade está em anos (fração para menores de 1 ano).
query_sim = f"""
SELECT
    id_municipio_residencia AS id_municipio,
    ano,
    COUNT(1) AS obitos_drsai_menores_5,
    COUNTIF(idade < 1) AS obitos_drsai_menores_1
FROM `{TABELA}`
WHERE ano = {ANO}
  AND idade < 5
  AND REGEXP_CONTAINS(causa_basica, r'^A0[0-9]')
GROUP BY id_municipio, ano
"""

df = bd.read_sql(query_sim, billing_project_id=PROJECT_ID)
df.to_csv(SAIDA, index=False)

total = int(df["obitos_drsai_menores_5"].sum())
print(f"Sucesso! '{SAIDA}' gerado: {total} óbitos em {len(df)} municípios.")
if total == 0:
    print("Aviso: nenhum óbito encontrado. Confira o formato da coluna idade antes de usar o resultado.")
