import React from 'react';
import { 
  ShieldCheck, 
  Coins, 
  Droplet, 
  AlertTriangle, 
  HeartPulse, 
  Download, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function Header({ isDarkMode, onToggleDarkMode, onExportCsv }) {
  return (
    <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              Observa<span className="text-blue-600 dark:text-blue-400">NEXA</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              Brasil Real
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Plataforma Integrada de Evidências: PIB • SINAN • SNIS • SIM
          </p>
        </div>
      </div>

      {/* Quick Metrics & Global Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-2 border-r border-slate-200 dark:border-slate-800 pr-4">
          <span 
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 cursor-help"
            title="PIB/IBGE: Produto Interno Bruto / Instituto Brasileiro de Geografia e Estatística"
          >
            <Coins className="w-3.5 h-3.5" /> PIB/IBGE
          </span>
          <span 
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center gap-1 cursor-help"
            title="SNIS: Sistema Nacional de Informações sobre Saneamento"
          >
            <Droplet className="w-3.5 h-3.5" /> SNIS
          </span>
          <span 
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 flex items-center gap-1 cursor-help"
            title="SINAN: Sistema de Informação de Agravos de Notificação"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> SINAN
          </span>
          <span 
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 flex items-center gap-1 cursor-help"
            title="SIM: Sistema de Informações sobre Mortalidade"
          >
            <HeartPulse className="w-3.5 h-3.5" /> SIM
          </span>
        </div>

        <button 
          onClick={onExportCsv} 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          title="Exportar base consolidada em formato CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Exportar CSV</span>
        </button>

        <button 
          onClick={onToggleDarkMode} 
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}