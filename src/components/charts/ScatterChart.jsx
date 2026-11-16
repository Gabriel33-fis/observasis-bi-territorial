import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import { GitCommit } from 'lucide-react';
import { METRIC_CONFIG, REGION_COLORS, calculatePearson } from '../../constants';

// Registro dos módulos do Chart.js
ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export default function ScatterChart({ data = [], onSelectUf, isDarkMode }) {
  const [xKey, setXKey] = useState('coleta_esgoto_pct');
  const [yKey, setYKey] = useState('taxa_mortalidade_100k');

  // Cálculo da correlação de Pearson e interpretação
  const { pearson, interpretation, badgeClass } = useMemo(() => {
    const xVals = data.map((d) => Number(d[xKey]) || 0);
    const yVals = data.map((d) => Number(d[yKey]) || 0);
    const r = calculatePearson(xVals, yVals);

    let interp = '';
    if (Math.abs(r) > 0.65) interp = r < 0 ? 'Forte Inversa' : 'Forte Direta';
    else if (Math.abs(r) > 0.35) interp = r < 0 ? 'Moderada Inversa' : 'Moderada Direta';
    else interp = 'Fraca / Dispersa';

    const bClass = Math.abs(r) > 0.4
      ? 'font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs'
      : 'font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs';

    return { pearson: r.toFixed(2), interpretation: interp, badgeClass: bClass };
  }, [data, xKey, yKey]);

  // Montagem dos datasets agrupados por região
  const chartData = useMemo(() => {
    const datasets = Object.keys(REGION_COLORS).map((reg) => {
      const statesInReg = data.filter((d) => d.regiao === reg);
      return {
        label: reg,
        data: statesInReg.map((d) => ({
          x: Number(d[xKey]) || 0,
          y: Number(d[yKey]) || 0,
          r: Math.max(5, Math.min(18, (Number(d.pib_per_capita || 0) / 85000) * 16)),
          state: d
        })),
        backgroundColor: REGION_COLORS[reg] + 'aa',
        borderColor: REGION_COLORS[reg],
        borderWidth: 1.5,
        hoverBorderWidth: 3
      };
    }).filter((ds) => ds.data.length > 0);

    return { datasets };
  }, [data, xKey, yKey]);

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
          font: { size: 10, family: 'Inter' },
          color: textColor
        }
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const raw = items[0]?.raw?.state;
            return raw ? `${raw.nome} (${raw.uf}) - Região ${raw.regiao}` : '';
          },
          label: (item) => {
            const s = item.raw.state;
            return [
              `Eixo X: ${item.raw.x}`,
              `Eixo Y: ${item.raw.y}`,
              `PIB per capita: R$ ${Number(s.pib_per_capita).toLocaleString('pt-BR')}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: METRIC_CONFIG[xKey]?.label || xKey,
          color: textColor,
          font: { size: 11, weight: '600' }
        },
        grid: { color: gridColor },
        ticks: { color: textColor }
      },
      y: {
        title: {
          display: true,
          text: METRIC_CONFIG[yKey]?.label || yKey,
          color: textColor,
          font: { size: 11, weight: '600' }
        },
        grid: { color: gridColor },
        ticks: { color: textColor }
      }
    },
    onClick: (evt, activeEls) => {
      if (activeEls.length > 0 && onSelectUf) {
        const datasetIndex = activeEls[0].datasetIndex;
        const index = activeEls[0].index;
        const clickedState = chartData.datasets[datasetIndex]?.data[index]?.state;
        if (clickedState) {
          onSelectUf(clickedState.uf);
        }
      }
    }
  }), [xKey, yKey, textColor, gridColor, chartData, onSelectUf]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                <GitCommit className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cruzamento Multidimensional (Dispersão)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Analise correlações empíricas com cálculo instantâneo do Coeficiente de Pearson (r)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <label htmlFor="scatter-x" className="text-slate-400 font-medium">Eixo X:</label>
              <select 
                id="scatter-x" 
                value={xKey} 
                onChange={(e) => setXKey(e.target.value)} 
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold py-1 px-2 rounded-lg border border-transparent focus:border-blue-500 transition-colors"
              >
                <option value="coleta_esgoto_pct">Cobertura de Esgoto % (SNIS)</option>
                <option value="atendimento_agua_pct">Cobertura de Água % (SNIS)</option>
                <option value="pib_per_capita">PIB per Capita (IBGE)</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <label htmlFor="scatter-y" className="text-slate-400 font-medium">Eixo Y:</label>
              <select 
                id="scatter-y" 
                value={yKey} 
                onChange={(e) => setYKey(e.target.value)} 
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold py-1 px-2 rounded-lg border border-transparent focus:border-blue-500 transition-colors"
              >
                <option value="taxa_mortalidade_100k">Mortalidade / 100k (SIM)</option>
                <option value="taxa_sinan_100k">Notificações / 100k (SINAN)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="w-full h-80 relative">
          <Bubble data={chartData} options={options} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Coeficiente de Pearson (r):
          </span>
          <span className={badgeClass}>
            {pearson} ({interpretation})
          </span>
        </div>
        <span className="text-slate-400 text-[11px]">
          Tamanho da bolha = <strong>PIB per Capita</strong> • Cores = <strong>Macrorregião</strong>
        </span>
      </div>
    </div>
  );
}

