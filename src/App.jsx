import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/layout/Header';
import FilterRibbon from './components/layout/FilterRibbon';
import KpiGrid from './components/kpi/KpiGrid';
import MapaVetorial from './components/map/MapaVetorial';
import Spotlight from './components/map/Spotlight';
import ScatterChart from './components/charts/ScatterChart';
import RegionBarChart from './components/charts/RegionBarChart';
import DataTable from './components/table/DataTable';
import { UF_METADATA } from './constants';
import { CheckCircle } from 'lucide-react';

export default function App() {
  // Estado base dos dados da federação e municípios
  const [allStates, setAllStates] = useState([]);
  const [allMunicipios, setAllMunicipios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos filtros e seleções
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedMetric, setSelectedMetric] = useState('coleta_esgoto_pct');
  const [selectedUf, setSelectedUf] = useState(null); // null = Visão Nacional (27 UFs)

  // Estado do tema Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('obs_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Estado do Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Sincronização da classe dark no elemento HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('obs_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('obs_theme', 'light');
    }
  }, [isDarkMode]);

  // Carregamento dos dados dos Estados e Municípios apenas UMA vez
  useEffect(() => {
    Promise.all([
      fetch('/dados_estados_dashboard.json')
        .catch(() => fetch('./dados_estados_dashboard.json'))
        .then((res) => {
          if (!res.ok) throw new Error('Falha ao carregar dados_estados_dashboard.json');
          return res.json();
        }),
      fetch('/dados_municipios_dashboard.json')
        .catch(() => fetch('./dados_municipios_dashboard.json'))
        .then((res) => {
          if (!res.ok) throw new Error('Falha ao carregar dados_municipios_dashboard.json');
          return res.json();
        })
    ])
      .then(([estadosRaw, municipiosRaw]) => {
        // Enriquece os dados com metadados geográficos (nomes e coordenadas)
        const enrichedEstados = estadosRaw.map((d) => ({
          ...d,
          nome: UF_METADATA[d.uf]?.nome || d.uf,
          lat: UF_METADATA[d.uf]?.lat || -14.23,
          lng: UF_METADATA[d.uf]?.lng || -51.92
        }));

        setAllStates(enrichedEstados);
        setAllMunicipios(municipiosRaw || []);
        setLoading(false);
        showToast('Dados consolidados de Estados e Municípios carregados!');
      })
      .catch((err) => {
        console.error('Erro ao buscar dados:', err);
        setLoading(false);
        showToast('Aviso: Verifique a existência dos arquivos JSON na pasta public.');
      });
  }, [showToast]);

  // Função para limpar seleção e retornar à Visão Nacional
  const clearSelection = useCallback(() => {
    setSelectedUf(null);
  }, []);

  // Recálculo memoizado dos dados filtrados por macrorregião
  const filteredData = useMemo(() => {
    if (selectedRegion === 'ALL') {
      return allStates;
    }
    return allStates.filter((d) => d.regiao === selectedRegion);
  }, [allStates, selectedRegion]);

  // Objeto do estado atualmente selecionado (ou null na Visão Nacional)
  const selectedState = useMemo(() => {
    if (!selectedUf) return null;
    return allStates.find((d) => d.uf === selectedUf) || null;
  }, [allStates, selectedUf]);

  // Recálculo memoizado dos KPIs agregados ponderados pela população
  const kpis = useMemo(() => {
    const count = filteredData.length;
    if (count === 0) {
      return {
        avgEsgoto: 0,
        popSemEsgoto: 0,
        avgSinan: 0,
        totalSinan: 0,
        avgMort: 0,
        totalObitos: 0,
        avgPib: 0,
        totalPop: 0
      };
    }

    const totalPop = filteredData.reduce((acc, d) => acc + (Number(d.populacao) || 0), 0);
    const safeTotalPop = totalPop || 1;

    const avgEsgoto = filteredData.reduce(
      (acc, d) => acc + (Number(d.coleta_esgoto_pct || 0) * Number(d.populacao || 0)), 0
    ) / safeTotalPop;

    const popSemEsgoto = totalPop * (1 - avgEsgoto / 100);

    const avgSinan = filteredData.reduce(
      (acc, d) => acc + (Number(d.taxa_sinan_100k || 0) * Number(d.populacao || 0)), 0
    ) / safeTotalPop;

    const totalSinan = filteredData.reduce((acc, d) => acc + (Number(d.total_notificacoes) || 0), 0);

    const avgMort = filteredData.reduce(
      (acc, d) => acc + (Number(d.taxa_mortalidade_100k || 0) * Number(d.populacao || 0)), 0
    ) / safeTotalPop;

    const totalObitos = filteredData.reduce((acc, d) => acc + (Number(d.total_obitos) || 0), 0);

    const avgPib = filteredData.reduce(
      (acc, d) => acc + (Number(d.pib_per_capita || 0) * Number(d.populacao || 0)), 0
    ) / safeTotalPop;

    return {
      avgEsgoto,
      popSemEsgoto,
      avgSinan,
      totalSinan,
      avgMort,
      totalObitos,
      avgPib,
      totalPop
    };
  }, [filteredData]);

  // Exportação para formato CSV
  const handleExportCsv = useCallback(() => {
    let csv = 'UF,Estado,Regiao,Populacao,PIB_per_Capita,Esgoto_SNIS_pct,Agua_SNIS_pct,SINAN_Taxa_100k,SIM_Taxa_Mortalidade_100k,Total_Obitos,Total_Notificacoes\n';
    filteredData.forEach((d) => {
      csv += `${d.uf},"${d.nome}",${d.regiao},${d.populacao},${d.pib_per_capita},${d.coleta_esgoto_pct},${d.atendimento_agua_pct},${d.taxa_sinan_100k},${d.taxa_mortalidade_100k},${d.total_obitos},${d.total_notificacoes}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `observasis_dados_brasil_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Base unificada (.CSV) exportada com sucesso!');
  }, [filteredData, showToast]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Cabeçalho */}
      <Header 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)} 
        onExportCsv={handleExportCsv} 
      />

      {/* Faixa de Filtros */}
      <FilterRibbon 
        selectedRegion={selectedRegion} 
        onRegionChange={setSelectedRegion} 
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Carregando dados consolidados dos sistemas de informação (Estados e Municípios)...
            </p>
          </div>
        ) : (
          <>
            {/* Grid de KPIs */}
            <KpiGrid kpis={kpis} />

            {/* Linha do Mapa e Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <MapaVetorial 
                  data={allStates}
                  selectedMetric={selectedMetric}
                  onMetricChange={setSelectedMetric}
                  selectedUf={selectedUf}
                  onSelectUf={setSelectedUf}
                  onResetView={clearSelection}
                />
              </div>

              <div className="lg:col-span-4">
                <Spotlight 
                  selectedState={selectedState}
                  allStates={allStates}
                />
              </div>
            </div>

            {/* Linha de Gráficos (Dispersão Multidimensional + Disparidade Regional) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <ScatterChart 
                  data={filteredData}
                  onSelectUf={setSelectedUf}
                  isDarkMode={isDarkMode}
                />
              </div>

              <div className="lg:col-span-4">
                <RegionBarChart 
                  allData={allStates}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Matriz Comparativa com Suporte a Drill-down Municipal */}
            <DataTable 
              selectedState={selectedState}
              statesData={filteredData}
              municipiosData={allMunicipios}
              totalStatesCount={allStates.length}
              onSelectState={setSelectedUf}
              onClearSelection={clearSelection}
            />
          </>
        )}
      </main>

      {/* Notificação Toast Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-2xl transition-all transform animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
