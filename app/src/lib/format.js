export function fmtN(n) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(n);
}

export function brl(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export function fD(t) {
  return new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function fDT(t) {
  return new Date(t).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function startOfDay(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function pad(n, l) {
  return String(n).padStart(l, '0');
}
