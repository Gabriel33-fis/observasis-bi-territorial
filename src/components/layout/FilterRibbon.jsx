import React from 'react';

const REGIONS = [
  { value: 'ALL', label: 'Todas as Regiões (27 UFs)' },
  { value: 'Norte', label: 'Norte (7 UFs)' },
  { value: 'Nordeste', label: 'Nordeste (9 UFs)' },
  { value: 'Centro-Oeste', label: 'Centro-Oeste (4 UFs)' },
  { value: 'Sudeste', label: 'Sudeste (4 UFs)' },
  { value: 'Sul', label: 'Sul (3 UFs)' },
];

export default function FilterRibbon({ selectedRegion, onRegionChange }) {
  return (
    <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 z-20 transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-region" className="text-slate-400 font-medium">Região:</label>
            <select 
              id="filter-region" 
              value={selectedRegion} 
              onChange={(e) => onRegionChange(e.target.value)} 
              className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 py-1.5 px-2.5 rounded-lg border border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Ano Base:</span>
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
              2021 (Auditado)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Dados integrados via BigQuery / Base dos Dados
          </span>
        </div>
      </div>
    </section>
  );
}

