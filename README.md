# ObservaSIS - Plataforma Integrada de Inteligência Territorial

Ambiente analítico interativo concebido para cruzar, correlacionar e espacializar indicadores socioeconómicos, ambientais e epidemiológicos do Brasil[cite: 4].

## 📌 Fontes de Dados Integradas (Ano Base: 2021)
* **PIB (IBGE):** Capacidade económica e PIB per capita municipal/estadual[cite: 4].
* **SNIS (MDR):** Índices de atendimento de água e recolha de esgotos[cite: 5].
* **SIM (DataSUS):** Mortalidade por Doenças Relacionadas ao Saneamento Ambiental Inadequado (DRSAI - CID-10 A00-A09).
* **SINAN (DataSUS):** Vigilância epidemiológica e agravos de transmissão ambiental/vetorial (Dengue)[cite: 5].

## 🛠️ Tecnologias Utilizadas
* **Engenharia de Dados (ETL):** Python 3, Pandas, Base dos Dados (Google Cloud BigQuery)[cite: 4, 6].
* **Front-end & Visualização:** HTML5, Tailwind CSS, JavaScript (ES6+), Chart.js, Leaflet.js e Lucide Icons.

## 🚀 Como Executar Localmente

1. Clone o repositório:
```bash
git clone [https://github.com/SEU_UTILIZADOR/NOME_DO_REPOSITORIO.git](https://github.com/SEU_UTILIZADOR/NOME_DO_REPOSITORIO.git)
cd NOME_DO_REPOSITORIO

Inicie um servidor HTTP local:

Bash
python3 -m http.server 8080
Aceda no navegador a:http://localhost:8080/dashboard.html