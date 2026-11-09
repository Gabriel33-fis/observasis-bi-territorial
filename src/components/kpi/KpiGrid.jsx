import React from 'react';
import { Droplets, Bug, HeartCrack, TrendingUp } from 'lucide-react';

export default function KpiGrid({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: SNIS - Esgotamento */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            SNIS • Esgotamento
          </span>
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
            <Droplets className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis.avgEsgoto.toFixed(1)}%
            </h3>
            <span className="text-xs font-medium text-slate-400">cobertura média</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Déficit populacional:</span>
            <strong className="text-amber-600 dark:text-amber-400 font-semibold">
              ~{(kpis.popSemEsgoto / 1000000).toFixed(1)} mi hab
            </strong>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-sky-600"></div>
      </div>

      {/* KPI 2: SINAN - Agravos Ambientais */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            • SINAN • Agravos Ambientais / Vetoriais
          </span>
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <Bug className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis.avgSinan.toFixed(1)}
            </h3>
            <span className="text-xs font-medium text-slate-400">por 100k hab.</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Total de notificações:</span>
            <strong className="text-rose-600 dark:text-rose-400 font-semibold">
              {kpis.totalSinan.toLocaleString('pt-BR')} notificações
            </strong>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-rose-600"></div>
      </div>

      {/* KPI 3: SIM - Óbitos Hídricos */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            SIM • Óbitos Hídricos (CID A00-A09)
          </span>
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <HeartCrack className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis.avgMort.toFixed(1)}
            </h3>
            <span className="text-xs font-medium text-slate-400">por 100k hab.</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Total de óbitos registrados:</span>
            <strong className="text-purple-600 dark:text-purple-400 font-semibold">
              {kpis.totalObitos.toLocaleString('pt-BR')} óbitos
            </strong>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
      </div>

      {/* KPI 4: PIB - Riqueza per capita */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            PIB • Riqueza per capita
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              R$ {Math.round(kpis.avgPib).toLocaleString('pt-BR')}
            </h3>
            <span className="text-xs font-medium text-slate-400">média ponderada</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>População analisada:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {(kpis.totalPop / 1000000).toFixed(1)} mi hab
            </strong>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
      </div>
    </div>
  );
}

