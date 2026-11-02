import basedosdados as bd
import pandas as pd

PROJECT_ID = "serious-hold-476711-r6"

print("--- Extraindo Óbitos por Doenças Hídricas/Saneamento (CID A00-A09) - SIM 2021 ---")

# Filtra especificamente as causas básicas de A00 a A09 (Cólera, diarreias, gastroenterites infecciosas)
query_sim = """
SELECT 
    id_municipio_residencia AS id_municipio,
    ano,
    COUNT(1) AS total_obitos
FROM `basedosdados.br_ms_sim.microdados`
WHERE ano = 2021
  AND (
      causa_basica LIKE 'A00%' OR causa_basica LIKE 'A01%' 
      OR causa_basica LIKE 'A02%' OR causa_basica LIKE 'A03%'
      OR causa_basica LIKE 'A04%' OR causa_basica LIKE 'A05%'
      OR causa_basica LIKE 'A06%' OR causa_basica LIKE 'A07%'
      OR causa_basica LIKE 'A08%' OR causa_basica LIKE 'A09%'
  )
GROUP BY id_municipio, ano
"""

df_sim = bd.read_sql(query_sim, billing_project_id=PROJECT_ID)
df_sim.to_csv("fato_sim.csv", index=False)
print(f"Sucesso! Novo arquivo fato_sim.csv gerado com {len(df_sim)} municípios com registros de DRSAI.")