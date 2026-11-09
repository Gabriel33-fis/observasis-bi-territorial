import React, { useMemo } from 'react';
import { Droplet, Activity, AlertCircle, Coins } from 'lucide-react';

export default function Spotlight({ selectedState, allStates = [] }) {
  // Cálculo do ranking nacional de saneamento
  const sanitationRank = useMemo(() => {
    if (!selectedState || allStates.length === 0) return '-';
    const sorted = [...allStates].sort((a, b) => (b.coleta_esgoto_pct || 0) - (a.coleta_esgoto_pct || 0));
    const index = sorted.findIndex((s) => s.uf === selectedState.uf);
    return index !== -1 ? `${index + 1}º do Brasil` : '-';
  }, [selectedState, allStates]);

  // Consumo do Índice Sintético de Vulnerabilidade (Calculado no Backend Python)
  const vulnerability = useMemo(() => {
    if (!selectedState || selectedState.indice_vulnerabilidade === undefined) {
      return { score: 0, label: '-', labelClass: 'text-slate-400', barClass: 'bg-slate-300' };
    }

    // Lê diretamente o dado exato gerado pelo processar_bi.py
    const score = Number(selectedState.indice_vulnerabilidade);

    if (score < 35) {
      return {
        score,
        label: 'Baixa Vulnerabilidade',
        labelClass: 'font-bold text-emerald-600 dark:text-emerald-400',
        barClass: 'h-full bg-emerald-500 rounded-full transition-all duration-300'
      };
    } else if (score < 50) {
      return {
        score,
        label: 'Média Vulnerabilidade',
        labelClass: 'font-bold text-amber-500 dark:text-amber-400',
        barClass: 'h-full bg-amber-500 rounded-full transition-all duration-300'
      };
    } else {
      return {
        score,
        label: 'Alta Vulnerabilidade Crítica',
        labelClass: 'font-bold text-rose-500 dark:text-rose-400',
        barClass: 'h-full bg-rose-500 rounded-full transition-all duration-300'
      };
    }
  }, [selectedState]);
  
  if (!selectedState) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-center items-center text-slate-400 text-xs">
        Selecione uma UF no mapa ou na tabela para inspecionar.
      </div>
    );
  }

  const popMilhoes = selectedState.populacao 
    ? `${(selectedState.populacao / 1000000).toFixed(1)} mi habitantes` 
    : '-';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Região {selectedState.regiao || '-'}
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {selectedState.nome || 'Selecione uma UF'}
            </h3>
            <p className="text-xs text-slate-400">
              População Estimada: {popMilhoes}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center">
            {selectedState.uf || '--'}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* Card Saneamento */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5" /> Saneamento Básico (SNIS)
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {sanitationRank}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Água Tratada:</span>
                <strong className="font-bold text-slate-800 dark:text-white text-sm">
                  {selectedState.atendimento_agua_pct}%
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Esgoto Coletado:</span>
                <strong className="font-bold text-slate-800 dark:text-white text-sm">
                  {selectedState.coleta_esgoto_pct}%
                </strong>
              </div>
            </div>
          </div>

          {/* Card Mortalidade */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Mortalidade (SIM)
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Taxa e Totais</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedState.taxa_mortalidade_100k}
                </span>
                <span className="text-[11px] text-slate-400 ml-1">por 100k hab.</span>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                Total de Óbitos: <strong className="text-slate-700 dark:text-slate-200">
                  {Number(selectedState.total_obitos || 0).toLocaleString('pt-BR')}
                </strong>
              </div>
            </div>
          </div>

          {/* Card Notificações */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Notificações (SINAN)
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {selectedState.taxa_sinan_100k} / 100k
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-400 text-xs">Total de Notificações:</span>
              <strong className="text-rose-500 font-bold text-sm">
                {Number(selectedState.total_notificacoes || 0).toLocaleString('pt-BR')}
              </strong>
            </div>
          </div>

          {/* Card PIB per Capita */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" /> PIB per Capita (IBGE)
              </span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                R$ {Number(selectedState.pib_per_capita || 0).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Vulnerabilidade */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-slate-500">Índice Sintético de Vulnerabilidade:</span>
          <span className={vulnerability.labelClass}>
            {vulnerability.label}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div 
            className={vulnerability.barClass} 
            style={{ width: `${vulnerability.score}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

