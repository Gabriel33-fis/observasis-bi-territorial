import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';
import { METRIC_CONFIG, formatMetric } from '../../constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const BAR_COLOR = '#2a78d6';

// Escreve o valor ao final de cada barra, para a leitura não depender do eixo
const valueLabelPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart, _args, opts) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.font = "600 12px Inter, sans-serif";
    ctx.fillStyle = opts.color;
    ctx.textBaseline = 'middle';
    meta.data.forEach((bar, i) => {
      ctx.fillText(opts.labels[i], bar.x + 8, bar.y);
    });
    ctx.restore();
  }
};

export default function RegionBarChart({ allData = [], isDarkMode, selectedMetric = 'coleta_esgoto_pct' }) {
  const conf = METRIC_CONFIG[selectedMetric] || {};

  // Média de cada macrorregião ponderada pela população (mesmo critério dos cartões do topo),
  // ordenada da maior para a menor
  const regioes = useMemo(() => {
    return REGIONS.map((reg) => {
      const subset = allData.filter((d) => d.regiao === reg && d[selectedMetric] != null);
      const pop = subset.reduce((acc, d) => acc + (Number(d.populacao) || 0), 0);
      if (subset.length === 0 || pop === 0) return null;
      const soma = subset.reduce((acc, d) => acc + Number(d[selectedMetric]) * (Number(d.populacao) || 0), 0);
      return { regiao: reg, valor: soma / pop };
    })
      .filter(Boolean)
      .sort((a, b) => b.valor - a.valor);
  }, [allData, selectedMetric]);

  const chartData = useMemo(() => ({
    labels: regioes.map((r) => r.regiao),
    datasets: [
      {
        label: conf.shortLabel || conf.label || selectedMetric,
        data: regioes.map((r) => r.valor),
        backgroundColor: BAR_COLOR,
        borderRadius: 4,
        barThickness: 22
      }
    ]
  }), [regioes, conf, selectedMetric]);

  const textColor = isDarkMode ? '#cbd5e1' : '#475569';
  const gridColor = isDarkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.7)';
  const maxValor = regioes.length ? Math.max(...regioes.map((r) => r.valor)) : 0;

  const options = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => `${formatMetric(selectedMetric, item.raw)} (média ponderada pela população)`
        }
      },
      valueLabels: {
        color: textColor,
        labels: regioes.map((r) => formatMetric(selectedMetric, r.valor))
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        // Folga à direita para o rótulo de valor caber depois da maior barra
        suggestedMax: maxValor * 1.3,
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 12 }, maxTicksLimit: 5 }
      },
      y: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 13, weight: '600' } }
      }
    }
  }), [textColor, gridColor, regioes, selectedMetric, maxValor]);

  // Frase de leitura calculada a partir dos dados exibidos
  const leitura = useMemo(() => {
    if (regioes.length < 2) return null;
    const maior = regioes[0];
    const menor = regioes[regioes.length - 1];
    const razao = menor.valor > 0 ? maior.valor / menor.valor : null;
    return { maior, menor, razao };
  }, [regioes]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Disparidade Regional
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {conf.label || selectedMetric}
            </p>
          </div>
          <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-4 h-4" />
          </span>
        </div>

        <div className="w-full h-72">
          <Bar data={chartData} options={options} plugins={[valueLabelPlugin]} />
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        {leitura ? (
          <p>
            Maior: <strong className="text-slate-700 dark:text-slate-200">{leitura.maior.regiao}</strong> ({formatMetric(selectedMetric, leitura.maior.valor)}).
            {' '}Menor: <strong className="text-slate-700 dark:text-slate-200">{leitura.menor.regiao}</strong> ({formatMetric(selectedMetric, leitura.menor.valor)}).
            {leitura.razao ? ` Diferença de ${leitura.razao.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} vezes.` : ''}
            {' '}Médias ponderadas pela população; a métrica acompanha a seleção do mapa.
          </p>
        ) : (
          <p>Sem dados para a métrica selecionada.</p>
        )}
      </div>
    </div>
  );
}
