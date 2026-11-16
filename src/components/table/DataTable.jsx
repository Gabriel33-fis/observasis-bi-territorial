import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileSpreadsheet, 
  ArrowUpDown, 
  ArrowLeft, 
  Building2, 
  MapPin, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export default function DataTable({
  selectedState = null,
  statesData = [],
  municipiosData = [],
  totalStatesCount = 27,
  onSelectState,
  onClearSelection
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('esgoto_pct');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const isDrillDown = Boolean(selectedState);

  // 1. DADOS DE MUNICÍPIOS FILTRADOS PELA UF SELECIONADA
  const currentMunicipios = useMemo(() => {
    if (!isDrillDown || !municipiosData.length) return [];
    return municipiosData.filter((m) => m.uf === selectedState.uf);
  }, [isDrillDown, municipiosData, selectedState]);

  // 2. ORDENAÇÃO E BUSCA DOS DADOS (ESTADOS OU MUNICÍPIOS)
  const processedData = useMemo(() => {
    if (!isDrillDown) {
      // === VISÃO NACIONAL (ESTADOS) ===
      let list = [...statesData];

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        list = list.filter(
          (d) => (d.nome && d.nome.toLowerCase().includes(q)) || (d.uf && d.uf.toLowerCase().includes(q))
        );
      }

      list.sort((a, b) => {
        let valA = a[sortColumn] ?? a.coleta_esgoto_pct;
        let valB = b[sortColumn] ?? b.coleta_esgoto_pct;

        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? (Number(valA) || 0) - (Number(valB) || 0) : (Number(valB) || 0) - (Number(valA) || 0);
      });

      return list;
    } else {
      // === VISÃO ESTADUAL (MUNICÍPIOS) ===
      let list = [...currentMunicipios];

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        list = list.filter((m) => m.nome_municipio && m.nome_municipio.toLowerCase().includes(q));
      }

      list.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? (Number(valA) || 0) - (Number(valB) || 0) : (Number(valB) || 0) - (Number(valA) || 0);
      });

      return list;
    }
  }, [isDrillDown, statesData, currentMunicipios, searchTerm, sortColumn, sortAsc]);

  // 3. PAGINAÇÃO PARA TABELA DE MUNICÍPIOS
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!isDrillDown) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [isDrillDown, processedData, currentPage, pageSize]);

  // Resetar página quando a busca ou estado mudar
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedState]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(false);
    }
  };

  // Exportação CSV de acordo com o contexto (Nacional ou Municipal)
  const handleExportCsv = () => {
    if (!isDrillDown) {
      let csv = 'UF,Estado,Regiao,Populacao,PIB_per_Capita,Esgoto_SNIS_pct,Agua_SNIS_pct,SINAN_Taxa_100k,SIM_Taxa_Mortalidade_100k,Total_Obitos,Total_Notificacoes\n';
      processedData.forEach((d) => {
        csv += `${d.uf},"${d.nome}",${d.regiao},${d.populacao},${d.pib_per_capita},${d.coleta_esgoto_pct},${d.atendimento_agua_pct},${d.taxa_sinan_100k},${d.taxa_mortalidade_100k},${d.total_obitos},${d.total_notificacoes}\n`;
      });
      downloadCsv(csv, `observasis_estados_${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      let csv = 'ID_Municipio,Municipio,UF,Regiao,Populacao,PIB_per_Capita,Esgoto_pct,Agua_pct,Taxa_Notificacoes_100k,Taxa_Obitos_100k,Indice_Vulnerabilidade\n';
      processedData.forEach((m) => {
        csv += `${m.id_municipio},"${m.nome_municipio}",${m.uf},${m.regiao},${m.populacao},${m.pib_per_capita},${m.esgoto_pct},${m.agua_pct},${m.taxa_notificacoes_100k},${m.taxa_obitos_100k},${m.indice_vulnerabilidade}\n`;
      });
      downloadCsv(csv, `observasis_municipios_${selectedState.uf}_${new Date().toISOString().slice(0, 10)}.csv`);
    }
  };

  const downloadCsv = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {isDrillDown && (
              <button
                onClick={onClearSelection}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl border border-blue-200 dark:border-blue-800 transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Voltar para a listagem das 27 Unidades Federativas"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Visão Nacional</span>
              </button>
            )}

            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              {isDrillDown ? (
                <>
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Municípios do estado - {selectedState.nome} ({selectedState.uf})</span>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Matriz Comparativa das 27 Unidades Federativas</span>
                </>
              )}
            </h3>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            {isDrillDown
              ? `Exibindo indicadores dos ${currentMunicipios.length} municípios catalogados em ${selectedState.nome}`
              : 'Clique em um estado para detalhar seus municípios (visão Drill-down)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isDrillDown ? "Filtrar município..." : "Filtrar por UF ou Estado..."} 
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none w-52 sm:w-60 text-slate-800 dark:text-slate-200 transition-colors"
            />
          </div>

          <button 
            onClick={handleExportCsv} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Tabela de Conteúdo */}
      <div className="overflow-x-auto max-h-[480px]">
        {!isDrillDown ? (
          // ================= TABELA NACIONAL (27 UFs) =================
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700 z-10">
              <tr>
                <th onClick={() => handleSort('uf')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors">
                  UF <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('nome')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors">
                  Estado <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('regiao')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors">
                  Região <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('coleta_esgoto_pct')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  Esgoto % (SNIS) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('atendimento_agua_pct')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  Água % (SNIS) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('taxa_sinan_100k')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  Notif. / 100k (SINAN) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('taxa_mortalidade_100k')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  Mort. / 100k (SIM) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('pib_per_capita')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  PIB per Capita (R$) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {processedData.map((d) => (
                <tr 
                  key={d.uf}
                  onClick={() => onSelectState && onSelectState(d.uf)}
                  className="hover:bg-blue-50/60 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                    {d.uf}
                  </td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium flex items-center justify-between">
                    <span>{d.nome}</span>
                    <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      Ver cidades ➔
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {d.regiao}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-right ${d.coleta_esgoto_pct < 40 ? 'text-rose-500 font-bold' : ''}`}>
                    {d.coleta_esgoto_pct}%
                  </td>
                  <td className="py-3 px-4 text-right">{d.atendimento_agua_pct}%</td>
                  <td className="py-3 px-4 text-right">{d.taxa_sinan_100k}</td>
                  <td className="py-3 px-4 text-right font-bold">{d.taxa_mortalidade_100k}</td>
                  <td className="py-3 px-4 text-right font-mono">
                    R$ {Number(d.pib_per_capita).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // ================= TABELA MUNICIPAL (DRILL-DOWN) =================
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700 z-10">
              <tr>
                <th onClick={() => handleSort('nome_municipio')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors">
                  Município <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('esgoto_pct')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  Esgoto (%) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('agua_pct')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  Água (%) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('taxa_notificacoes_100k')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  Notif. / 100k <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('taxa_obitos_100k')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  Mort. / 100k <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('pib_per_capita')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-right">
                  PIB per Capita (R$) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th onClick={() => handleSort('indice_vulnerabilidade')} className="py-3 px-4 cursor-pointer hover:text-blue-500 transition-colors text-center">
                  Índice de Vulnerabilidade <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Nenhum município encontrado para a busca especificada.
                  </td>
                </tr>
              ) : (
                paginatedData.map((m) => {
                  const vuln = Number(m.indice_vulnerabilidade) || 0;
                  let vulnBadge = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
                  if (vuln >= 60) {
                    vulnBadge = 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold';
                  } else if (vuln >= 35) {
                    vulnBadge = 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold';
                  }

                  return (
                    <tr 
                      key={m.id_municipio}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {m.nome_municipio}
                      </td>
                      <td className={`py-3 px-4 text-right ${m.esgoto_pct < 40 ? 'text-rose-500 font-bold' : ''}`}>
                        {m.esgoto_pct != null ? `${Number(m.esgoto_pct).toFixed(1)}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {m.agua_pct != null ? `${Number(m.agua_pct).toFixed(1)}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {m.taxa_notificacoes_100k != null ? Number(m.taxa_notificacoes_100k).toFixed(1) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {m.taxa_obitos_100k != null ? Number(m.taxa_obitos_100k).toFixed(2) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        R$ {Number(m.pib_per_capita || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] ${vulnBadge}`}>
                          {vuln.toFixed(1)} pts
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer / Paginação */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>
          {isDrillDown
            ? `Exibindo ${paginatedData.length} de ${processedData.length} municípios em ${selectedState.nome} (${selectedState.uf})`
            : `Exibindo ${processedData.length} de ${totalStatesCount} estados`}
        </span>

        {isDrillDown && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Próxima Página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <span>Fontes: IBGE (Contas Regionais), SNIS (Água e Esgotos), DATASUS (SIM/SINAN)</span>
      </div>
    </div>
  );
}
