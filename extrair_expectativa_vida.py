"""Extrai a esperança de vida ao nascer por UF da planilha oficial do IBGE.

Fonte: IBGE, Projeções da População: Brasil e Unidades da Federação - Revisão 2024,
tabela "Indicadores Implícitos" (dados_ibge/projecoes_2024_tab4_indicadores.xlsx).
Gera o arquivo ref_expectativa_vida_uf.json, lido pelo processar_bi.py.

Requer: pip install pandas openpyxl
"""
import json
import pandas as pd

ANO = 2021
PLANILHA = "dados_ibge/projecoes_2024_tab4_indicadores.xlsx"
SAIDA = "ref_expectativa_vida_uf.json"

print(f"--- Extraindo esperança de vida ao nascer (e0_T) - IBGE {ANO} ---")

# O cabeçalho com os nomes das colunas (ANO, CÓD., SIGLA, LOCAL, ..., e0_T) está na 7ª linha
df = pd.read_excel(PLANILHA, sheet_name=0, header=6)
df = df.dropna(subset=["ANO", "CÓD."])
df["ANO"] = df["ANO"].astype(int)
df["CÓD."] = df["CÓD."].astype(int)

df_ano = df[df["ANO"] == ANO]
# Códigos 11 a 53 são as Unidades da Federação; 0 é o Brasil e 1 a 5 são as Grandes Regiões
df_uf = df_ano[df_ano["CÓD."].between(11, 53)]
if len(df_uf) != 27:
    raise ValueError(f"Esperadas 27 UFs, encontradas {len(df_uf)}.")

valores = {sigla: round(float(e0), 2) for sigla, e0 in zip(df_uf["SIGLA"], df_uf["e0_T"])}
brasil = round(float(df_ano.loc[df_ano["CÓD."] == 0, "e0_T"].iloc[0]), 2)

referencia = {
    "indicador": "Esperança de vida ao nascer (anos), ambos os sexos (e0_T)",
    "ano": ANO,
    "fonte": "IBGE, Projeções da População: Brasil e Unidades da Federação - Revisão 2024 (Indicadores Implícitos)",
    "arquivo": PLANILHA,
    "observacao": "Os valores de 2021 refletem o impacto da pandemia de Covid-19.",
    "brasil": brasil,
    "valores": dict(sorted(valores.items())),
}

with open(SAIDA, "w", encoding="utf-8") as f:
    json.dump(referencia, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"Sucesso! '{SAIDA}' gerado com {len(valores)} UFs (Brasil: {brasil} anos).")
