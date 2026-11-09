import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

export default function RegionBarChart({ allData = [], isDarkMode }) {
  const chartData = useMemo(() => {
    const avgEsgoto = [];
    const avgMortalidade = [];

    REGIONS.forEach((reg) => {
      const subset = allData.filter((d) => d.regiao === reg);
      if (subset.length === 0) {
        avgEsgoto.push(0);
        avgMortalidade.push(0);
        return;
      }
      const meanEsg = subset.reduce((acc, curr) => acc + (Number(curr.coleta_esgoto_pct) || 0), 0) / subset.length;
      const meanMort = subset.reduce((acc, curr) => acc + (Number(curr.taxa_mortalidade_100k) || 0), 0) / subset.length;
      avgEsgoto.push(parseFloat(meanEsg.toFixed(1)));
      avgMortalidade.push(parseFloat(meanMort.toFixed(1)));
    });

    return {
      labels: REGIONS,
      datasets: [
        {
          label: 'Esgoto Coletado (%)',
          data: avgEsgoto,
          backgroundColor: '#0284c7',
          borderRadius: 6
        },
        {
          label: 'Mortalidade / 100k hab',
          data: avgMortalidade,
          backgroundColor: '#ef4444',
          borderRadius: 6
        }
      ]
    };
  }, [allData]);

  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.7)';

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          color: textColor,
          font: { size: 10, family: 'Inter' }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 10 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 10 } }
      }
    }
  }), [textColor, gridColor]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Disparidade Regional
            </h3>
            <p className="text-xs text-slate-400">
              Médias agregadas por macrorregiões brasileiras
            </p>
          </div>
          <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
            <BarChart3 className="w-4 h-4" />
          </span>
        </div>

        <div className="w-full h-72">
          <Bar data={chartData} options={options} />
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <p>
          <strong className="text-slate-700 dark:text-slate-200">Análise de BI:</strong> O gráfico evidencia a assimetria na infraestrutura de saneamento entre as macrorregiões do país.
        </p>
      </div>
    </div>
  );
}

