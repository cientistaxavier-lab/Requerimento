import { DAY, CCOF } from '../data/seed';
import { startOfDay } from './format';

// Encontra um item pelo id, olhando também os itens arquivados (excluídos),
// para que o histórico de movimentações e solicitações continue legível.
export function findItem(data, id) {
  return (
    data.items.find((i) => i.id === id) ||
    (data.archived || []).find((i) => i.id === id)
  );
}

export function stOf(it) {
  return it.qty <= 0 ? 'out' : it.qty < it.min ? 'low' : 'ok';
}

export const stLabel = { ok: 'Normal', low: 'Abaixo do mínimo', out: 'Ruptura' };

export const rsClass = {
  Pendente: 'p-wait',
  'Aguardando gestor': 'p-wait',
  Aprovada: 'p-info',
  Entregue: 'p-ok',
  Recusada: 'p-rej',
};

export function outByItem(data, days) {
  const since = Date.now() - days * DAY;
  const m = {};
  data.movs.forEach((x) => {
    if (x.type === 'saida' && x.ts >= since) m[x.itemId] = (m[x.itemId] || 0) - x.delta;
  });
  return m;
}

export function coverage(it, out) {
  const avg = (out[it.id] || 0) / 30;
  return avg > 0 ? it.qty / avg : null;
}

export function fmtCov(c) {
  if (c === null) return 'sem consumo';
  if (c < 1) return 'menos de 1 dia';
  return 'cerca de ' + Math.round(c) + ' dias';
}

export function reqValue(data, r) {
  return r.items.reduce((a, l) => {
    const it = findItem(data, l.id);
    return a + (it ? l.qty * it.cost : 0);
  }, 0);
}

export function needsGestor(data, r) {
  return reqValue(data, r) > data.limit;
}

export function freeSlots(data) {
  const used = {};
  data.items.forEach((i) => (used[i.loc] = 1));
  const out = [];
  ['A', 'B', 'C', 'D'].forEach((c) => {
    for (let lv = 1; lv <= 3; lv++)
      for (let b = 1; b <= 6; b++) {
        const k = c + b + '-' + lv;
        if (!used[k]) out.push(k);
      }
  });
  return out;
}

export function reposRows(data) {
  const out = outByItem(data, 30);
  return data.items
    .filter((i) => stOf(i) !== 'ok')
    .map((i) => ({ it: i, cov: coverage(i, out), avg: (out[i.id] || 0) / 30, buy: Math.max(0, i.max - i.qty) }))
    .sort((a, b) => {
      const ca = a.cov === null ? 1e9 : a.cov;
      const cb = b.cov === null ? 1e9 : b.cov;
      return ca - cb;
    });
}

export function findTool(data, id) {
  return (data.tools || []).find((t) => t.id === id) || (data.archivedTools || []).find((t) => t.id === id);
}

// Um solicitante fica bloqueado enquanto tiver uma ferramenta emprestada com o prazo vencido.
export function blockingLoan(data, userName) {
  return (data.toolLoans || []).find((l) => l.requester === userName && l.status === 'Emprestada' && l.dueAt && Date.now() > l.dueAt) || null;
}

export function isUserBlocked(data, userName) {
  return !!blockingLoan(data, userName);
}

export function loanDisplayStatus(l) {
  if (l.status === 'Emprestada' && l.dueAt && Date.now() > l.dueAt) return 'Atrasada';
  return l.status;
}

export function timeLeftLabel(dueAt) {
  if (!dueAt) return '';
  const ms = dueAt - Date.now();
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  const m = Math.round((abs % 3600000) / 60000);
  const txt = (h > 0 ? h + 'h ' : '') + m + 'min';
  return ms >= 0 ? 'faltam ' + txt : 'atrasada há ' + txt;
}

export function alertList(data, isGestor) {
  const A = [];
  const out = outByItem(data, 30);
  const now = Date.now();
  data.items.forEach((i) => {
    const s = stOf(i);
    const cov = coverage(i, out);
    if (s === 'out') A.push({ k: 'bad', id: i.id, t: i.name + ' está em ruptura' });
    else if (s === 'low')
      A.push({ k: 'warn', id: i.id, t: i.name + ' está abaixo do mínimo (' + i.qty + ' de ' + i.min + ')' });
    else if (i.qty < i.min * 1.2)
      A.push({ k: 'watch', id: i.id, t: i.name + ' está perto do mínimo (' + i.qty + ' de ' + i.min + ')' });
    else if (cov !== null && cov < 5)
      A.push({ k: 'watch', id: i.id, t: i.name + ' cobre apenas ' + Math.max(1, Math.round(cov)) + ' dias de consumo' });
  });
  data.reqs.forEach((r) => {
    if (r.status === 'Pendente' && now - r.ts > DAY) A.push({ k: 'warn', t: r.id + ' aguarda decisão há mais de 24 horas' });
    if (r.status === 'Aguardando gestor' && isGestor) A.push({ k: 'warn', t: r.id + ' aguarda a sua aprovação' });
  });
  (data.toolLoans || []).forEach((l) => {
    if (l.status === 'Pendente' && now - l.ts > DAY) A.push({ k: 'warn', t: l.id + ' (empréstimo de ferramenta) aguarda decisão há mais de 24 horas' });
    if (l.status === 'Emprestada' && l.dueAt) {
      const tool = findTool(data, l.toolId);
      if (now > l.dueAt) A.push({ k: 'bad', t: (tool ? tool.name : 'Ferramenta') + ' está atrasada com ' + l.requester + ' (' + timeLeftLabel(l.dueAt) + ')' });
      else if (l.dueAt - now < 3600000) A.push({ k: 'watch', t: (tool ? tool.name : 'Ferramenta') + ' com ' + l.requester + ' vence em breve (' + timeLeftLabel(l.dueAt) + ')' });
    }
  });
  const o = { bad: 0, warn: 1, watch: 2 };
  return A.sort((a, b) => o[a.k] - o[b.k]);
}

export function teamProd(data, operators, days) {
  const since = startOfDay(Date.now()) - (days - 1) * DAY;
  const g = {};
  operators.forEach((o) => (g[o] = { n: 0, u: 0, i: 0, o: 0 }));
  data.movs.forEach((m) => {
    if (m.ts < since) return;
    const k = g[m.who] || (g[m.who] = { n: 0, u: 0, i: 0, o: 0 });
    k.n++;
    k.u += Math.abs(m.delta);
    if (m.type === 'entrada') k.i++;
    else if (m.type === 'saida') k.o++;
  });
  return Object.keys(g)
    .map((k) => ({ label: k, value: g[k].n, units: g[k].u, ins: g[k].i, outs: g[k].o }))
    .sort((a, b) => b.value - a.value);
}

export function topRequested(data, days, limit) {
  const since = Date.now() - days * DAY;
  const g = {};
  data.movs.forEach((m) => {
    if (m.type === 'saida' && m.ts >= since) {
      const k = g[m.itemId] || (g[m.itemId] = { n: 0, u: 0 });
      k.n++;
      k.u -= m.delta;
    }
  });
  return Object.keys(g)
    .map((id) => ({ id, label: findItem(data, id).name, value: g[id].n, units: g[id].u }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function since(days) {
  return Date.now() - days * DAY;
}

export function grp(arr, keyFn) {
  const g = {};
  arr.forEach((x) => {
    const k = keyFn(x);
    (g[k] || (g[k] = [])).push(x);
  });
  return g;
}

export { CCOF };
