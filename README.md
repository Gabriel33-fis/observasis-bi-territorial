# ObservaSIS

**Plataforma Integrada de Inteligência Territorial**

Ambiente analítico interativo que cruza, correlaciona e espacializa indicadores socioeconômicos, ambientais e epidemiológicos do Brasil, permitindo investigar como saneamento, renda e saúde pública se relacionam nos territórios.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Ano base](https://img.shields.io/badge/ano%20base-2021-blue)
![Python](https://img.shields.io/badge/Python-3-3776AB?logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)

---

## 📑 Sumário

- [Visão geral](#-visão-geral)
- [Fontes de dados](#-fontes-de-dados-integradas-ano-base-2021)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#️-tecnologias-utilizadas)
- [Como executar localmente](#-como-executar-localmente)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Limitações e observações](#️-limitações-e-observações)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Visão geral

O ObservaSIS reúne em um único painel bases públicas de diferentes áreas e as relaciona por território. A proposta é responder perguntas como:

- Municípios e estados com menor cobertura de água e esgoto apresentam maior mortalidade por doenças relacionadas ao saneamento inadequado?
- Como a capacidade econômica (PIB per capita) se associa aos indicadores de saneamento e de saúde?
- Onde se concentram os agravos de transmissão ambiental e vetorial, como a dengue?

O painel combina gráficos interativos e mapas, com dados tratados previamente por um pipeline de ETL.

## 📌 Fontes de dados integradas (ano base: 2021)

| Fonte | Órgão | Indicadores utilizados |
|-------|-------|------------------------|
| **PIB** | IBGE | Capacidade econômica e PIB per capita municipal e estadual |
| **SNIS** | MDR | Índices de atendimento de água e de coleta de esgoto |
| **SIM** | DataSUS | Mortalidade por Doenças Relacionadas ao Saneamento Ambiental Inadequado (DRSAI, CID-10 A00-A09) |
| **SINAN** | DataSUS | Vigilância epidemiológica de agravos de transmissão ambiental e vetorial (dengue) |

> Os dados são obtidos por meio da [Base dos Dados](https://basedosdados.org/) (Google Cloud BigQuery).

## 🧩 Arquitetura

```text
Fontes públicas ──► ETL (Python + Pandas) ──► Dados tratados ──► Dashboard (HTML + JS)
 IBGE · SNIS          Base dos Dados            (arquivos          Chart.js · Leaflet.js
 SIM · SINAN          (BigQuery)                 estáticos)         Tailwind CSS
```

1. **Extração:** consultas à Base dos Dados (BigQuery) para cada fonte.
2. **Transformação:** limpeza, padronização de códigos territoriais e cruzamento dos indicadores com Pandas.
3. **Visualização:** painel estático que consome os dados tratados e os apresenta em gráficos e mapas.

## 🛠️ Tecnologias utilizadas

**Engenharia de dados (ETL)**
- Python 3
- Pandas
- Base dos Dados (Google Cloud BigQuery)

**Front-end e visualização**
- HTML5
- Tailwind CSS
- JavaScript (ES6+)
- Chart.js
- Leaflet.js
- Lucide Icons

## 🚀 Como executar localmente

### Pré-requisitos

- [Git](https://git-scm.com/)
- [Python 3](https://www.python.org/downloads/) (usado apenas para servir os arquivos estáticos)
- Um navegador moderno

### Passo a passo

1. Clone o repositório:

   ```bash
   git clone https://github.com/Gabriel33-fis/observasis-bi-territorial
   cd observasis-bi-territorial
   ```

2. Inicie um servidor HTTP local:

   ```bash
   python3 -m http.server 8080
   ```

3. Acesse no navegador:

   ```text
   http://localhost:8080/dashboard.html
   ```

> **Por que um servidor local?** Navegadores bloqueiam o carregamento de arquivos de dados (`fetch`) quando a página é aberta diretamente pelo sistema de arquivos (`file://`).

### Executando o ETL (opcional)

O repositório já inclui os dados tratados. Para reprocessá-los, é necessário um projeto no Google Cloud com acesso ao BigQuery e a biblioteca da Base dos Dados:

```bash
pip install pandas basedosdados
```

Em seguida, execute o script de ETL (ajuste o nome conforme o seu projeto):

```bash
python3 etl.py
```

## 📂 Estrutura do projeto

> Ajuste os nomes abaixo para refletir a organização real do repositório.

```text
.
├── dashboard.html     # Painel interativo (página principal)
├── etl.py             # Pipeline de extração e transformação
├── data/              # Dados tratados consumidos pelo painel
└── README.md
```

## ⚠️ Limitações e observações

- Os dados correspondem ao **ano base de 2021**; comparações temporais não estão incluídas.
- As correlações exibidas indicam **associação**, não causalidade.
- A cobertura e a qualidade dos dados variam entre municípios, sobretudo nos indicadores do SNIS, que dependem de declaração dos prestadores de serviço.
- Os dados de mortalidade (SIM) e de agravos (SINAN) podem sofrer subnotificação.

## 🤝 Contribuição

Contribuições são bem-vindas. Para propor mudanças:

1. Faça um fork do projeto.
2. Crie uma branch para a sua alteração (`git checkout -b minha-melhoria`).
3. Faça o commit (`git commit -m "Descreve a melhoria"`).
4. Envie a branch (`git push origin minha-melhoria`) e abra um Pull Request.

## 📄 Licença

Defina aqui a licença do projeto (por exemplo, MIT) e adicione o arquivo `LICENSE` na raiz do repositório.

## ✍️ Autor

**Gabriel** — estudante de Sistemas Inteligentes na FATEC Pompéia.
