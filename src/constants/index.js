import { fmtNum, fmtPct, fmtBRL } from '../utils/format';

export const UF_METADATA = {
  'AC': { nome: 'Acre', lat: -9.0238, lng: -70.812 },
  'AL': { nome: 'Alagoas', lat: -9.5713, lng: -36.782 },
  'AM': { nome: 'Amazonas', lat: -3.4168, lng: -65.856 },
  'AP': { nome: 'Amapá', lat: 1.41, lng: -51.77 },
  'BA': { nome: 'Bahia', lat: -12.9714, lng: -38.5014 },
  'CE': { nome: 'Ceará', lat: -5.4984, lng: -39.3206 },
  'DF': { nome: 'Distrito Federal', lat: -15.7998, lng: -47.8645 },
  'ES': { nome: 'Espírito Santo', lat: -19.1834, lng: -40.3089 },
  'GO': { nome: 'Goiás', lat: -15.827, lng: -49.8362 },
  'MA': { nome: 'Maranhão', lat: -5.42, lng: -45.44 },
  'MG': { nome: 'Minas Gerais', lat: -18.5122, lng: -44.555 },
  'MS': { nome: 'Mato Grosso do Sul', lat: -20.7722, lng: -54.7852 },
  'MT': { nome: 'Mato Grosso', lat: -12.6819, lng: -56.9211 },
  'PA': { nome: 'Pará', lat: -3.79, lng: -52.48 },
  'PB': { nome: 'Paraíba', lat: -7.24, lng: -36.78 },
  'PE': { nome: 'Pernambuco', lat: -8.8137, lng: -36.9541 },
  'PI': { nome: 'Piauí', lat: -7.7183, lng: -42.7289 },
  'PR': { nome: 'Paraná', lat: -24.89, lng: -51.55 },
  'RJ': { nome: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  'RN': { nome: 'Rio Grande do Norte', lat: -5.7945, lng: -36.5615 },
  'RO': { nome: 'Rondônia', lat: -11.5057, lng: -63.5806 },
  'RR': { nome: 'Roraima', lat: 2.7376, lng: -62.0751 },
  'RS': { nome: 'Rio Grande do Sul', lat: -30.0346, lng: -51.2177 },
  'SC': { nome: 'Santa Catarina', lat: -27.2423, lng: -50.2189 },
  'SE': { nome: 'Sergipe', lat: -10.5741, lng: -37.3857 },
  'SP': { nome: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  'TO': { nome: 'Tocantins', lat: -10.1753, lng: -48.2982 }
};

export const METRIC_CONFIG = {
  coleta_esgoto_pct: {
    label: 'SNIS: Esgoto Coletado (%)',
    shortLabel: 'SNIS: % Coleta Esgoto',
    unit: '%',
    decimals: 1
  },
  atendimento_agua_pct: {
    label: 'SNIS: Água Tratada (%)',
    shortLabel: 'SNIS: % Atendimento Água',
    unit: '%',
    decimals: 1
  },
  taxa_sinan_100k: {
    label: 'SINAN: Taxa / 100k hab',
    shortLabel: 'SINAN: Notificações / 100k hab',
    unit: '',
    decimals: 1
  },
  taxa_mortalidade_100k: {
    label: 'SIM: Óbitos Hídricos / 100k hab (CID A00-A09)',
    shortLabel: 'SIM: Mortalidade / 100k hab',
    unit: '',
    decimals: 2
  },
  pib_per_capita: {
    label: 'PIB per Capita (R$)',
    shortLabel: 'PIB per Capita (R$)',
    unit: 'R$'
  }
};

export const REGION_COLORS = {
  'Norte': '#0284c7',
  'Nordeste': '#f59e0b',
  'Centro-Oeste': '#8b5cf6',
  'Sudeste': '#10b981',
  'Sul': '#ec4899',
};

// Paleta sequencial de um único matiz, do claro (menor valor) ao escuro (maior valor)
export const SEQUENTIAL_RAMP = ['#b7d3f6', '#6da7ec', '#2a78d6', '#1c5cab', '#0d366b'];
export const NO_DATA_COLOR = '#cbd5e1';

// Limites entre as classes, calculados por quantis dos valores exibidos (quintis por padrão).
// Assim cada faixa reúne aproximadamente o mesmo número de estados, qualquer que seja a métrica.
export function computeBreaks(values, classes = SEQUENTIAL_RAMP.length) {
  const sorted = (values || [])
    .filter((v) => v !== null && v !== undefined && Number.isFinite(Number(v)))
    .map(Number)
    .sort((a, b) => a - b);
  if (sorted.length === 0) return { min: 0, max: 0, breaks: [] };

  const breaks = [];
  for (let i = 1; i < classes; i++) {
    const pos = (sorted.length - 1) * (i / classes);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    breaks.push(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
  }
  return { min: sorted[0], max: sorted[sorted.length - 1], breaks };
}

// Índice da classe (0 = mais clara) em que o valor cai
export function getClassIndex(val, scale) {
  let i = 0;
  while (i < scale.breaks.length && Number(val) > scale.breaks[i]) i++;
  return i;
}

// Cor do valor na escala; valores ausentes recebem cinza neutro
export function getColorForValue(val, scale) {
  if (val === null || val === undefined || !Number.isFinite(Number(val)) || !scale) return NO_DATA_COLOR;
  return SEQUENTIAL_RAMP[getClassIndex(val, scale)];
}

// Faixas da legenda, geradas a partir dos mesmos limites usados para colorir o mapa
export function getLegendItems(scale, metricKey) {
  if (!scale || scale.breaks.length === 0) return [];
  const limites = [scale.min, ...scale.breaks, scale.max];
  return SEQUENTIAL_RAMP.map((color, i) => ({
    color,
    label: `${formatMetric(metricKey, limites[i])} a ${formatMetric(metricKey, limites[i + 1])}`
  }));
}

// Formata o valor de uma métrica no padrão brasileiro, com a unidade e as casas decimais dela
export function formatMetric(metricKey, val) {
  const conf = METRIC_CONFIG[metricKey] || {};
  if (conf.unit === '%') return fmtPct(val, conf.decimals ?? 1);
  if (conf.unit === 'R$') return fmtBRL(val);
  return fmtNum(val, conf.decimals ?? 1);
}

export function calculatePearson(xArr, yArr) {
  const n = xArr.length;
  if (n === 0) return 0;
  const meanX = xArr.reduce((a, b) => a + b, 0) / n;
  const meanY = yArr.reduce((a, b) => a + b, 0) / n;

  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xArr[i] - meanX;
    const dy = yArr[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

