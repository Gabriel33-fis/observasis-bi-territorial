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
    min: 0,
    max: 100,
    invertColor: false
  },
  atendimento_agua_pct: {
    label: 'SNIS: Água Tratada (%)',
    shortLabel: 'SNIS: % Atendimento Água',
    unit: '%',
    min: 30,
    max: 100,
    invertColor: false
  },
  taxa_sinan_100k: {
    label: 'SINAN: Taxa / 100k hab',
    shortLabel: 'SINAN: Notificações / 100k hab',
    unit: '',
    min: 10,
    max: 2000,
    invertColor: true
  },
  taxa_mortalidade_100k: {
    label: 'SIM: Óbitos Hídricos / 100k hab (CID A00-A09)',
    shortLabel: 'SIM: Mortalidade / 100k hab',
    unit: '',
    min: 0,
    max: 12,
    invertColor: true
  },
  pib_per_capita: {
    label: 'PIB per Capita (R$)',
    shortLabel: 'PIB per Capita (R$)',
    unit: 'R$',
    min: 15000,
    max: 90000,
    invertColor: false
  }
};

export const REGION_COLORS = {
  'Norte': '#0284c7',
  'Nordeste': '#f59e0b',
  'Centro-Oeste': '#8b5cf6',
  'Sudeste': '#10b981',
  'Sul': '#ec4899',
};

export function getColorForValue(val, metricKey) {
  const conf = METRIC_CONFIG[metricKey];
  if (!conf) return '#94a3b8';
  const norm = Math.max(0, Math.min(1, (val - conf.min) / (conf.max - conf.min)));
  const effective = conf.invertColor ? (1 - norm) : norm;

  if (effective < 0.25) return '#ef4444';
  if (effective < 0.50) return '#f97316';
  if (effective < 0.70) return '#eab308';
  if (effective < 0.85) return '#06b6d4';
  return '#10b981';
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

