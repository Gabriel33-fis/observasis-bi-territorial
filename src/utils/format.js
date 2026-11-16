// Formatação numérica no padrão brasileiro (vírgula decimal, ponto de milhar).
// Valores ausentes viram um travessão, para não serem confundidos com zero.

const AUSENTE = '—';

function ehNumero(v) {
  return v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));
}

export function fmtNum(v, casas = 1) {
  if (!ehNumero(v)) return AUSENTE;
  return Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  });
}

export function fmtInt(v) {
  return fmtNum(v, 0);
}

export function fmtPct(v, casas = 1) {
  return ehNumero(v) ? `${fmtNum(v, casas)}%` : AUSENTE;
}

export function fmtBRL(v) {
  return ehNumero(v) ? `R$ ${fmtNum(v, 0)}` : AUSENTE;
}

export function fmtMilhoes(v, casas = 1) {
  return ehNumero(v) ? `${fmtNum(Number(v) / 1000000, casas)} mi` : AUSENTE;
}
