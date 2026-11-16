# 🌐 ObservaSIS — Plataforma Integrada de Inteligência Territorial

> **Evidências empíricas integrando Saúde Pública, Infraestrutura de Saneamento e Economia nos 5.570 municípios brasileiros.**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4.1-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud_BigQuery-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/bigquery)
[![Status](https://img.shields.io/badge/Status-Produção-10B981?style=for-the-badge)]()

---

## 📑 Sumário

- [🎯 1. Visão Geral](#-1-visão-geral)
- [🛠️ 2. Stack Tecnológica Atualizada](#️-2-stack-tecnológica-atualizada)
- [🏗️ 3. Nova Arquitetura & Fluxo de Dados](#️-3-nova-arquitetura--fluxo-de-dados)
- [✨ 4. Funcionalidades em Destaque](#-4-funcionalidades-em-destaque)
  - [🧮 Índice Sintético de Vulnerabilidade Territorial](#-índice-sintético-de-vulnerabilidade-territorial)
  - [🔍 Análise com Drill-down Multiescalar](#-análise-com-drill-down-multiescalar-nacional--estadual)
  - [💎 Mineração de Outliers: "Milagres da Gestão Pública"](#-mineração-de-outliers-milagres-da-gestão-pública)
  - [🗺️ Mapa Vetorial Otimizado com Leaflet Imperativo](#️-mapa-vetorial-otimizado-com-leaflet-imperativo)
- [📁 5. Estrutura do Repositório](#-5-estrutura-do-repositório)
- [🚀 6. Como Executar Localmente](#-6-como-executar-localmente)
  - [A. Executando o Frontend (React + Vite)](#a-executando-o-frontend-react--vite)
  - [B. Executando o Pipeline de Dados ETL (Python)](#b-executando-o-pipeline-de-dados-etl-python)
- [🛡️ 7. Política de Versionamento de Dados (.gitignore)](#️-7-política-de-versionamento-de-dados-gitignore)
- [📄 8. Licença](#-8-licença)

---

## 🎯 1. Visão Geral

O **ObservaSIS** é uma plataforma analítica de Business Intelligence territorial e suporte à tomada de decisão pública. O projeto responde a gargalos históricos do pacto federativo brasileiro, articulando dados de saneamento, riqueza municipal e desfechos de saúde pública em escala atômica (municípios) e agregada (unidades federativas e macrorregiões).

### Perguntas centrais respondidas pela plataforma:
1. **Assimetria Sanitária vs. Óbitos:** Onde a precariedade de esgotamento sanitário (SNIS) correlaciona-se com maior taxa de mortalidade por Doenças Relacionadas ao Saneamento Ambiental Inadequado (*DRSAI, CID-10 A00-A09 via SIM/DATASUS*)?
2. **Correlação Empírica de Pearson ($r$):** Qual a força e direção da relação entre renda *per capita* (IBGE) e incidência de agravos vetoriais/ambientais (*dengue via SINAN/DATASUS*)?
3. **Eficiência de Políticas Públicas:** Quais municípios com baixa renda conseguiram universalizar o saneamento e romper o ciclo histórico de vulnerabilidade?

---

## 🛠️ 2. Stack Tecnológica Atualizada

O projeto evoluiu de uma prova de conceito estática para uma arquitetura moderna dividida entre **Engenharia de Dados (ETL)** e **Frontend Reativo Componentizado**:

### 💻 Frontend & Visualização (SPA)
| Tecnologia | Versão | Aplicação no Projeto |
| :--- | :--- | :--- |
| **React** | `18.2.0` | Arquitetura de componentes reativos, hooks de ciclo de vida e estado global |
| **Vite** | `5.1.0` | Ferramenta de build ultrarrápida com Hot Module Replacement (HMR) e empacotamento otimizado |
| **Tailwind CSS** | `3.4.1` | Sistema de design utility-first com suporte nativo a Dark Mode e layout responsivo |
| **Chart.js** & **react-chartjs-2** | `4.4.1 / 5.2.0` | Gráficos dinâmicos de dispersão (Bubble Chart com cálculo instantâneo de Pearson) e barras regionais |
| **Leaflet** *(Vanilla)* | `1.9.4` | Mapa coroplético e vetorial com renderização imperativa via `useRef`, sem overhead de wrappers |
| **Lucide-React** | `0.344.0` | Conjunto de ícones vetoriais modernos tree-shakable |

### 🐍 Engenharia de Dados & Modelagem (ETL)
| Tecnologia | Aplicação no Pipeline |
| :--- | :--- |
| **Python 3.10+** | Orquestração do processamento relacional e cálculo das matrizes analíticas |
| **Pandas & NumPy** | Limpeza, padronização de códigos IBGE (6 dígitos), modelagem dimensional e agregações ponderadas |
| **Base dos Dados (BigQuery)** | Extração em escala de microdados dos censos e registros administrativos federais |
| **Requests (API IBGE)** | Enriquecimento automatizado da toponímia e nomes oficiais dos 5.570 municípios |

---

## 🏗️ 3. Nova Arquitetura & Fluxo de Dados

A arquitetura adota a metodologia de **Modelagem Dimensional (Star Schema)** no pipeline de dados e entrega JSONs pré-calculados e cacheados para o consumo leve da interface:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          1. FONTES PÚBLICAS FEDERAIS                            │
│    IBGE (PIB/Pop)  •  SNIS (Água/Esgoto)  •  SIM (Óbitos)  •  SINAN (Notificações)│
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │  Consultas SQL via Base dos Dados
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       2. PIPELINE ETL (processar_bi.py)                         │
│  - Padronização de chaves primárias municipais (id_municipio em 6 dígitos)       │
│  - Criação da Dimensão Territorial (dLocalidade: UF, Macrorregião, População)    │
│  - Consolidação relacional das Tabelas Fato (PIB, SNIS, SIM, SINAN)              │
│  - Cálculo do Índice Sintético de Vulnerabilidade Territorial (0 a 100)          │
│  - Mineração de Outliers de Gestão Pública Eficiente                             │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │  Exportação Otimizada
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       3. BASES CONSOLIDADAS (/public)                           │
│     dados_estados_dashboard.json (27 UFs)  •  dados_municipios_dashboard.json (5.570)│
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │  Consumo via useEffect / Fetch
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         4. FRONTEND REACT (Vite SPA)                            │
│  - App.jsx: Estado central, filtros reativos e cálculo ponderado de KPIs         │
│  - MapaVetorial: Coroplético Leaflet com Carto Voyager (Zero API Key Block)     │
│  - DataTable: Matriz com navegação Drill-down (Nacional ➔ Municipal)            │
│  - Scatter & Bar Charts: Correlação empírica de Pearson e assimetria regional   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ 4. Funcionalidades em Destaque

### 🧮 Índice Sintético de Vulnerabilidade Territorial
Desenvolvido para sintetizar dimensões sanitárias, clínicas e de renda em uma escala contínua de **0 a 100 pontos**. O índice adota a seguinte formulação matemática ponderada:

$$Score_{\text{esgoto}} = 100 - \%_{\text{coleta\_esgoto}}$$

$$Score_{\text{mortalidade}} = \left( \frac{\text{Taxa Óbitos DRSAI por 100k}}{\max(\text{Taxa Óbitos})} \right) \times 100$$

$$Score_{\text{pobreza}} = \left( 1 - \frac{\text{PIB per capita}}{\max(\text{PIB per capita})} \right) \times 100$$

$$\mathbf{Índice\ de\ Vulnerabilidade} = (Score_{\text{esgoto}} \times 0.40) + (Score_{\text{mortalidade}} \times 0.40) + (Score_{\text{pobreza}} \times 0.20)$$

* **🟢 Baixa Vulnerabilidade ($< 35$ pts):** Infraestrutura sanitária robusta e baixos índices de mortes evitáveis.
* **🟡 Média Vulnerabilidade ($35 - 60$ pts):** Gargalos parciais de atendimento com vulnerabilidade moderada.
* **🔴 Alta Vulnerabilidade Crítica ($\ge 60$ pts):** Déficit grave de esgoto concomitante a elevadas taxas de mortalidade.

---

### 🔍 Análise com Drill-down Multiescalar (Nacional ➔ Estadual)
A tabela analítica (`DataTable.jsx`) opera com renderização condicional orientada a estado:
1. **Visão Nacional (27 UFs):** Apresenta o panorama das 27 Unidades Federativas com médias ponderadas de população, ordenação em todas as colunas e busca em tempo real.
2. **Drill-down com 1 Clique:** Ao selecionar um estado (no mapa, gráfico ou tabela), a visualização se transforma instantaneamente na **Visão Estadual**, listando todos os municípios pertencentes àquela UF com indicadores atômicos e tag de vulnerabilidade.
3. **Botão Contextual `⬅ Voltar para Visão Nacional`:** Permite descer e subir nos níveis territoriais sem perder os filtros globais aplicados.

---

### 💎 Mineração de Outliers: "Milagres da Gestão Pública"
O pipeline em Python executa uma rotina algorítmica de mineração de anomalias positivas de gestão:
* **Critério de Seleção:** Municípios situados no primeiro quartil de renda ($\text{PIB per capita} \le Q_1$) que, simultaneamente, atingiram índices de atendimento de esgoto sanitário iguais ou superiores a **90%**.
* **Impacto:** Isola cidades que superaram restrições orçamentárias severas e universalizaram a infraestrutura sanitária, servindo como modelo de estudo de caso para a gestão pública.

---

### 🗺️ Mapa Vetorial Otimizado com Leaflet Imperativo
- **Integração sem memory leaks:** Implementado em componente isolado (`MapaVetorial.jsx`) utilizando `useRef` e ciclo duplo de `useEffect` (um para instanciação única com cleanup `map.remove()` e outro para reatividade de estilos e métricas).
- **Sem erro de API Key:** Configurado com basemaps abertos **Carto Voyager** (`https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`), eliminando requisições bloqueadas por autenticação.

---

## 📁 5. Estrutura do Repositório

```text
observasis-bi-territorial/
├── public/
│   ├── dados_estados_dashboard.json       # Base consolidada das 27 UFs
│   └── dados_municipios_dashboard.json    # Base atômica dos 5.570 municípios
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── RegionBarChart.jsx         # Gráfico de barras por macrorregiões
│   │   │   └── ScatterChart.jsx           # Bubble chart com cálculo de Pearson (r)
│   │   ├── kpi/
│   │   │   └── KpiGrid.jsx                # Grid com os 4 cartões consolidados
│   │   ├── layout/
│   │   │   ├── FilterRibbon.jsx           # Seletor de região e badges
│   │   │   └── Header.jsx                 # Cabeçalho, Dark Mode e Exportar CSV
│   │   ├── map/
│   │   │   ├── MapaVetorial.jsx           # Mapa Leaflet Vanilla com useRef
│   │   │   └── Spotlight.jsx              # Painel lateral da UF em foco
│   │   └── table/
│   │       └── DataTable.jsx              # Tabela com navegação Drill-down
│   ├── constants/
│   │   └── index.js                       # Metadados de UFs, cores e escalas
│   ├── App.jsx                            # Orquestrador central e estado global
│   ├── index.css                          # Diretivas Tailwind e estilização de tooltips
│   └── main.jsx                           # Entrada React 18
├── processar_bi.py                        # Script do pipeline de ETL e modelagem
├── extrair_dados.py                       # Consultas à Base dos Dados / BigQuery
├── extrair_sim_drsai.py                   # Extração de mortalidade CID A00-A09
├── index.html                             # Template HTML da SPA Vite
├── tailwind.config.js                     # Configurações de tema e paleta de cores
├── vite.config.js                         # Configurações do servidor Vite
└── package.json                           # Manifesto de dependências do frontend
```

---

## 🚀 6. Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão **18.0** ou superior
- [Python](https://www.python.org/) versão **3.10** ou superior (apenas se for reexecutar o ETL)
- [Git](https://git-scm.com/)

---

### A. Executando o Frontend (React + Vite)

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Gabriel33-fis/observasis-bi-territorial.git
   cd observasis-bi-territorial
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   ```text
   http://localhost:3000/
   ```

5. *(Opcional)* Para gerar o build de produção compilado:
   ```bash
   npm run build
   npm run preview
   ```

---

### B. Executando o Pipeline de Dados ETL (Python)

Caso deseje reprocessar as bases brutas e recalcular os índices:

1. **Crie e ative um ambiente virtual:**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux / macOS:
   source .venv/bin/activate
   ```

2. **Instale os pacotes de dados:**
   ```bash
   pip install pandas numpy requests basedosdados
   ```

3. **Execute o script de processamento e mineração:**
   ```bash
   python processar_bi.py
   ```

> O script atualizará as bases consolidadas e exportará os arquivos `dados_estados_dashboard.json` e `dados_municipios_dashboard.json`.

---

## 🛡️ 7. Política de Versionamento de Dados (.gitignore)

> [!NOTE]
> **Nota Técnica sobre Integridade do Repositório:**
> Para garantir performance no Git e evitar estouro de limites de armazenamento de arquivos binários/pesados, **todas as bases brutas e tabelas intermediárias em formato `.csv` estão estritamente inclusas no `.gitignore`** (ex: `fato_*.csv`, `dim_*.csv`, `base_consolidada_*.csv`).
>
> Apenas os arquivos de consumo direto da interface hospedados em `public/`:
> - `public/dados_estados_dashboard.json`
> - `public/dados_municipios_dashboard.json`
>
> possuem permissão de rastreamento no versionamento, garantindo que a aplicação React funcione imediatamente em qualquer ambiente de deploy (Vercel, Netlify, GitHub Pages) sem dependência de execução do pipeline Python em tempo de compilação.

---

## 📄 8. Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para obter mais detalhes.

---

<div align="center">
  <sub>ObservaSIS • Plataforma de Inteligência Territorial e Saúde Pública baseada em Evidências.</sub>
</div>
