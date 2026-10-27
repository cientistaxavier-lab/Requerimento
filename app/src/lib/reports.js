import { brl, fmtN, fDT, fD } from './format';
import { findItem, stOf, stLabel, reposRows, since, grp, CCOF, findTool, loanDisplayStatus, blockingLoan } from './domain';
import { CCS, TOOL_STATUS_LABEL } from '../data/seed';

function repPosicao(data) {
  const rows = [...data.items].sort((a, b) => b.qty * b.cost - a.qty * a.cost);
  const tot = rows.reduce((a, i) => a + i.qty * i.cost, 0);
  return {
    summary: [
      { l: 'Itens', v: rows.length },
      { l: 'Valor em estoque', v: brl(tot) },
      { l: 'Abaixo do mínimo', v: rows.filter((i) => stOf(i) !== 'ok').length },
    ],
    chart: { title: 'Itens de maior valor em estoque', data: rows.slice(0, 8).map((i) => ({ label: i.name, value: i.qty * i.cost })), fmt: (d) => brl(d.value) },
    cols: [{ h: 'Código' }, { h: 'Item' }, { h: 'Categoria' }, { h: 'Posição' }, { h: 'Saldo', num: 1 }, { h: 'Unidade' }, { h: 'Custo unitário', num: 1, f: brl }, { h: 'Valor em estoque', num: 1, f: brl }, { h: 'Situação' }],
    rows: rows.map((i) => [i.code, i.name, i.cat, i.loc, i.qty, i.unit, i.cost, Math.round(i.qty * i.cost * 100) / 100, stLabel[stOf(i)]]),
  };
}

function repMovs(data, days) {
  const l = data.movs.filter((m) => m.ts >= since(days)).slice().reverse();
  let inn = 0, out = 0, aj = 0;
  l.forEach((m) => { if (m.type === 'entrada') inn++; else if (m.type === 'saida') out++; else aj++; });
  return {
    summary: [{ l: 'Movimentações', v: l.length }, { l: 'Entradas', v: inn }, { l: 'Saídas', v: out }, { l: 'Ajustes', v: aj }],
    chart: { title: 'Lançamentos por tipo', data: [{ label: 'Entradas', value: inn }, { label: 'Saídas', value: out }, { label: 'Ajustes', value: aj }] },
    cols: [{ h: 'Data e hora' }, { h: 'Tipo' }, { h: 'Item' }, { h: 'Quantidade', num: 1 }, { h: 'Unidade' }, { h: 'Responsável' }, { h: 'Setor' }, { h: 'Documento' }],
    rows: l.map((m) => {
      const it = findItem(data, m.itemId);
      return [fDT(m.ts), { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' }[m.type], it.name, m.delta, it.unit, m.who, m.sector, m.ref];
    }),
  };
}

function repSetor(data, days) {
  const l = data.movs.filter((m) => m.type === 'saida' && m.ts >= since(days) && m.sector);
  const g = grp(l, (m) => m.sector);
  const rows = Object.keys(g)
    .map((k) => {
      const val = g[k].reduce((a, m) => a - m.delta * findItem(data, m.itemId).cost, 0);
      return [k, g[k].length, g[k].reduce((a, m) => a - m.delta, 0), Math.round(val * 100) / 100];
    })
    .sort((a, b) => b[3] - a[3]);
  const tot = rows.reduce((a, r) => a + r[3], 0);
  return {
    summary: [{ l: 'Setores atendidos', v: rows.length }, { l: 'Saídas', v: l.length }, { l: 'Valor consumido', v: brl(tot) }],
    chart: { title: 'Valor consumido por setor', data: rows.map((r) => ({ label: r[0], value: r[3] })), fmt: (d) => brl(d.value) },
    cols: [{ h: 'Setor' }, { h: 'Saídas', num: 1 }, { h: 'Unidades', num: 1 }, { h: 'Valor consumido', num: 1, f: brl }],
    rows,
  };
}

function repCentro(data, days) {
  const l = data.movs.filter((m) => m.type === 'saida' && m.ts >= since(days));
  const g = grp(l, (m) => m.cc || CCOF[m.sector] || 'Sem centro de custo');
  const nm = {};
  CCS.forEach((c) => (nm[c[0]] = c[1]));
  const rows = Object.keys(g)
    .map((k) => {
      const v = g[k].reduce((a, m) => a - m.delta * findItem(data, m.itemId).cost, 0);
      return [k, nm[k] || '', g[k].length, g[k].reduce((a, m) => a - m.delta, 0), Math.round(v * 100) / 100];
    })
    .sort((a, b) => b[4] - a[4]);
  const tot = rows.reduce((a, r) => a + r[4], 0);
  return {
    summary: [{ l: 'Centros de custo', v: rows.length }, { l: 'Saídas', v: l.length }, { l: 'Valor apropriado', v: brl(tot) }],
    chart: { title: 'Valor por centro de custo', data: rows.map((r) => ({ label: r[0] + ' ' + r[1], value: r[4] })), fmt: (d) => brl(d.value) },
    cols: [{ h: 'Centro de custo' }, { h: 'Descrição' }, { h: 'Saídas', num: 1 }, { h: 'Unidades', num: 1 }, { h: 'Valor apropriado', num: 1, f: brl }],
    rows,
  };
}

function repTop(data, days) {
  const l = data.movs.filter((m) => m.type === 'saida' && m.ts >= since(days));
  const g = grp(l, (m) => m.itemId);
  const rows = Object.keys(g)
    .map((id) => {
      const it = findItem(data, id);
      const u = g[id].reduce((a, m) => a - m.delta, 0);
      return [it.code, it.name, g[id].length, u, it.unit, Math.round(u * it.cost * 100) / 100];
    })
    .sort((a, b) => b[2] - a[2] || b[3] - a[3])
    .slice(0, 15);
  return {
    summary: [{ l: 'Itens com saída', v: Object.keys(g).length }, { l: 'Total de saídas', v: l.length }],
    chart: { title: 'Itens com mais saídas', data: rows.slice(0, 8).map((r) => ({ label: r[1], value: r[2] })), fmt: (d) => d.value + ' saídas' },
    cols: [{ h: 'Código' }, { h: 'Item' }, { h: 'Saídas', num: 1 }, { h: 'Unidades', num: 1 }, { h: 'Unidade' }, { h: 'Valor', num: 1, f: brl }],
    rows,
  };
}

function repSol(data, days) {
  const l = data.reqs.filter((r) => r.ts >= since(days)).sort((a, b) => b.ts - a.ts);
  const st = { Pendente: 0, 'Aguardando gestor': 0, Aprovada: 0, Entregue: 0, Recusada: 0 };
  l.forEach((r) => st[r.status]++);
  const dec = l.filter((r) => r.decidedAt);
  const okN = st.Aprovada + st.Entregue;
  const avg = dec.length ? dec.reduce((a, r) => a + (r.decidedAt - r.ts), 0) / dec.length / 3600000 : 0;
  const decided = okN + st.Recusada;
  return {
    summary: [
      { l: 'Solicitações', v: l.length },
      { l: 'Taxa de aprovação', v: decided ? Math.round((okN / decided) * 100) + '%' : 'sem decisões' },
      { l: 'Recusadas', v: st.Recusada },
      { l: 'Tempo médio até decidir', v: dec.length ? fmtN(avg) + ' h' : 'sem decisões' },
    ],
    chart: { title: 'Solicitações por situação', data: Object.keys(st).map((k) => ({ label: k, value: st[k] })) },
    cols: [{ h: 'Número' }, { h: 'Data' }, { h: 'Solicitante' }, { h: 'Setor' }, { h: 'Urgência' }, { h: 'Itens', num: 1 }, { h: 'Situação' }, { h: 'Horas até decidir', num: 1 }, { h: 'Motivo da recusa' }],
    rows: l.map((r) => [r.id, fDT(r.ts), r.requester, r.sector, r.urgency, r.items.length, r.status, r.decidedAt ? Math.round((r.decidedAt - r.ts) / 360000) / 10 : '', r.rejectReason]),
  };
}

function repProd(data, days) {
  const l = data.movs.filter((m) => m.ts >= since(days));
  const g = grp(l, (m) => m.who);
  const rows = Object.keys(g)
    .map((k) => {
      const a = g[k];
      return [k, a.length, a.filter((m) => m.type === 'entrada').length, a.filter((m) => m.type === 'saida').length, a.reduce((s, m) => s + Math.abs(m.delta), 0), Math.round((a.length / days) * 10) / 10];
    })
    .sort((a, b) => b[1] - a[1]);
  return {
    summary: [{ l: 'Operadores ativos', v: rows.length }, { l: 'Movimentações', v: l.length }, { l: 'Média por dia', v: fmtN(l.length / days) }],
    chart: { title: 'Movimentações por operador', data: rows.map((r) => ({ label: r[0], value: r[1] })) },
    cols: [{ h: 'Operador' }, { h: 'Movimentações', num: 1 }, { h: 'Entradas', num: 1 }, { h: 'Saídas', num: 1 }, { h: 'Unidades movimentadas', num: 1 }, { h: 'Média por dia', num: 1 }],
    rows,
  };
}

function repParados(data, days) {
  const used = {};
  data.movs.forEach((m) => { if (m.type === 'saida' && m.ts >= since(days)) used[m.itemId] = 1; });
  const last = {};
  data.movs.forEach((m) => { if (m.type === 'saida') last[m.itemId] = Math.max(last[m.itemId] || 0, m.ts); });
  const rows = data.items
    .filter((i) => !used[i.id] && i.qty > 0)
    .map((i) => [i.code, i.name, i.qty, i.unit, Math.round(i.qty * i.cost * 100) / 100, last[i.id] ? fD(last[i.id]) : 'sem registro'])
    .sort((a, b) => b[4] - a[4]);
  const tot = rows.reduce((a, r) => a + r[4], 0);
  return {
    summary: [{ l: 'Itens sem saída', v: rows.length }, { l: 'Capital parado', v: brl(tot) }],
    chart: { title: 'Maior capital parado', data: rows.slice(0, 8).map((r) => ({ label: r[1], value: r[4] })), fmt: (d) => brl(d.value) },
    cols: [{ h: 'Código' }, { h: 'Item' }, { h: 'Saldo', num: 1 }, { h: 'Unidade' }, { h: 'Valor parado', num: 1, f: brl }, { h: 'Última saída' }],
    rows,
  };
}

function repCriticos(data) {
  const rows = reposRows(data);
  const tot = rows.reduce((a, r) => a + r.buy * r.it.cost, 0);
  const withCov = rows.filter((r) => r.cov !== null);
  return {
    summary: [{ l: 'Itens críticos', v: rows.length }, { l: 'Em ruptura', v: rows.filter((r) => stOf(r.it) === 'out').length }, { l: 'Custo para repor', v: brl(tot) }],
    chart: { title: 'Menor cobertura em dias', data: withCov.slice(0, 8).map((r) => ({ label: r.it.name, value: Math.round(r.cov * 10) / 10 })), fmt: (d) => fmtN(d.value) + ' dias' },
    cols: [{ h: 'Código' }, { h: 'Item' }, { h: 'Saldo', num: 1 }, { h: 'Mínimo', num: 1 }, { h: 'Consumo por dia', num: 1 }, { h: 'Cobertura em dias', num: 1 }, { h: 'Sugestão de compra', num: 1 }, { h: 'Custo estimado', num: 1, f: brl }, { h: 'Situação' }],
    rows: rows.map((r) => [r.it.code, r.it.name, r.it.qty, r.it.min, Math.round(r.avg * 10) / 10, r.cov === null ? '' : Math.round(r.cov * 10) / 10, r.buy, Math.round(r.buy * r.it.cost * 100) / 100, stLabel[stOf(r.it)]]),
  };
}

function repFerramentas(data, days) {
  const l = data.toolLoans.filter((x) => x.ts >= since(days)).slice().sort((a, b) => b.ts - a.ts);
  const st = { Pendente: 0, Aprovada: 0, Emprestada: 0, Atrasada: 0, Devolvida: 0, Recusada: 0 };
  l.forEach((x) => st[loanDisplayStatus(x)]++);
  const atrasos = l.filter((x) => x.status === 'Devolvida' && x.returnedAt > x.dueAt);
  const now = Date.now();
  return {
    summary: [
      { l: 'Empréstimos', v: l.length },
      { l: 'Em andamento', v: st.Emprestada + st.Atrasada },
      { l: 'Atrasados agora', v: st.Atrasada },
      { l: 'Devolvidos com atraso', v: atrasos.length },
    ],
    chart: { title: 'Empréstimos por situação', data: Object.keys(st).map((k) => ({ label: k, value: st[k] })) },
    cols: [{ h: 'Empréstimo' }, { h: 'Ferramenta' }, { h: 'Solicitante' }, { h: 'Setor' }, { h: 'Retirada' }, { h: 'Prazo' }, { h: 'Devolução' }, { h: 'Atraso (h)', num: 1 }, { h: 'Situação' }],
    rows: l.map((x) => {
      const t = findTool(data, x.toolId);
      const end = x.returnedAt || (loanDisplayStatus(x) === 'Atrasada' ? now : 0);
      const atraso = x.dueAt && end && end > x.dueAt ? Math.round(((end - x.dueAt) / 3600000) * 10) / 10 : 0;
      return [x.id, t ? t.patrimonio + ' ' + t.name : x.toolId, x.requester, x.sector, x.deliveredAt ? fDT(x.deliveredAt) : '', x.dueAt ? fDT(x.dueAt) : '', x.returnedAt ? fDT(x.returnedAt) : '', atraso, loanDisplayStatus(x)];
    }),
  };
}

function repFerramentasPosicao(data) {
  const rows = [...data.tools].sort((a, b) => a.patrimonio.localeCompare(b.patrimonio));
  const tot = rows.reduce((a, t) => a + t.cost, 0);
  const emprestadas = rows.filter((t) => t.status === 'emprestada');
  const byCat = grp(rows, (t) => t.cat);
  return {
    summary: [
      { l: 'Ferramentas cadastradas', v: rows.length },
      { l: 'Valor do patrimônio', v: brl(tot) },
      { l: 'Emprestadas agora', v: emprestadas.length },
    ],
    chart: {
      title: 'Valor do patrimônio por categoria',
      data: Object.keys(byCat).map((k) => ({ label: k, value: byCat[k].reduce((a, t) => a + t.cost, 0) })),
      fmt: (d) => brl(d.value),
    },
    cols: [{ h: 'Patrimônio' }, { h: 'Ferramenta' }, { h: 'Categoria' }, { h: 'Custo de reposição', num: 1, f: brl }, { h: 'Situação' }, { h: 'Com quem' }, { h: 'Desde quando' }],
    rows: rows.map((t) => {
      const loan = t.status === 'emprestada' ? data.toolLoans.find((l) => l.toolId === t.id && l.status === 'Emprestada') : null;
      return [t.patrimonio, t.name, t.cat, t.cost, TOOL_STATUS_LABEL[t.status], loan ? loan.requester : '', loan ? fDT(loan.deliveredAt) : ''];
    }),
  };
}

function repFerramentasTop(data, days) {
  const l = data.toolLoans.filter((x) => x.ts >= since(days) && x.status !== 'Recusada');
  const g = grp(l, (x) => x.toolId);
  const rows = Object.keys(g)
    .map((id) => {
      const t = findTool(data, id);
      const a = g[id];
      const horas = a.reduce((s, x) => s + (x.approvedHours || x.requestedHours || 0), 0);
      return [t ? t.patrimonio : id, t ? t.name : id, a.length, Math.round(horas * 10) / 10, t ? brl(t.cost) : ''];
    })
    .sort((a, b) => b[2] - a[2])
    .slice(0, 15);
  return {
    summary: [{ l: 'Ferramentas com pedido', v: Object.keys(g).length }, { l: 'Total de empréstimos', v: l.length }],
    chart: { title: 'Ferramentas mais requisitadas', data: rows.slice(0, 8).map((r) => ({ label: r[1], value: r[2] })), fmt: (d) => d.value + ' empréstimos' },
    cols: [{ h: 'Patrimônio' }, { h: 'Ferramenta' }, { h: 'Empréstimos', num: 1 }, { h: 'Horas pedidas', num: 1 }, { h: 'Custo de reposição' }],
    rows,
  };
}

function repFerramentasSetor(data, days) {
  const l = data.toolLoans.filter((x) => x.ts >= since(days) && x.sector && x.status !== 'Recusada');
  const g = grp(l, (x) => x.sector);
  const rows = Object.keys(g)
    .map((k) => {
      const a = g[k];
      const horas = a.reduce((s, x) => s + (x.approvedHours || x.requestedHours || 0), 0);
      const atrasos = a.filter((x) => loanDisplayStatus(x) === 'Atrasada' || (x.returnedAt && x.returnedAt > x.dueAt)).length;
      return [k, a.length, Math.round(horas * 10) / 10, atrasos];
    })
    .sort((a, b) => b[2] - a[2]);
  return {
    summary: [{ l: 'Setores atendidos', v: rows.length }, { l: 'Empréstimos', v: l.length }],
    chart: { title: 'Horas emprestadas por setor', data: rows.map((r) => ({ label: r[0], value: r[2] })), fmt: (d) => fmtN(d.value) + ' h' },
    cols: [{ h: 'Setor' }, { h: 'Empréstimos', num: 1 }, { h: 'Horas pedidas', num: 1 }, { h: 'Atrasos', num: 1 }],
    rows,
  };
}

function repFerramentasAtrasos(data, days) {
  const now = Date.now();
  const l = data.toolLoans.filter((x) => x.ts >= since(days) && x.dueAt);
  const horasAtraso = (x) => {
    const end = x.returnedAt || (loanDisplayStatus(x) === 'Atrasada' ? now : 0);
    return x.dueAt && end && end > x.dueAt ? (end - x.dueAt) / 3600000 : 0;
  };
  const comAtraso = l.filter((x) => horasAtraso(x) > 0);
  const g = grp(comAtraso, (x) => x.requester);
  const rows = Object.keys(g)
    .map((k) => {
      const a = g[k];
      const horas = a.map(horasAtraso);
      return [k, a[0].sector, a.length, Math.round(horas.reduce((s, h) => s + h, 0) * 10) / 10, Math.round(Math.max(...horas) * 10) / 10];
    })
    .sort((a, b) => b[3] - a[3]);
  const bloqueados = [...new Set(data.toolLoans.map((x) => x.requester))].filter((name) => blockingLoan(data, name)).length;
  return {
    summary: [
      { l: 'Solicitantes com atraso', v: rows.length },
      { l: 'Horas de atraso no total', v: fmtN(rows.reduce((a, r) => a + r[3], 0)) },
      { l: 'Bloqueados agora', v: bloqueados },
    ],
    chart: { title: 'Horas de atraso por solicitante', data: rows.slice(0, 8).map((r) => ({ label: r[0], value: r[3] })), fmt: (d) => fmtN(d.value) + ' h' },
    cols: [{ h: 'Solicitante' }, { h: 'Setor' }, { h: 'Empréstimos atrasados', num: 1 }, { h: 'Horas de atraso (total)', num: 1 }, { h: 'Pior atraso (h)', num: 1 }],
    rows,
  };
}

export const REPORTS = [
  { id: 'posicao', t: 'Posição de estoque', d: 'Saldo, custo e valor de cada item', fn: (data) => repPosicao(data), period: false },
  { id: 'movs', t: 'Movimentações', d: 'Entradas, saídas e ajustes no período', fn: repMovs, period: true },
  { id: 'setor', t: 'Consumo por setor', d: 'Quanto cada setor retirou', fn: repSetor, period: true },
  { id: 'centro', t: 'Consumo por centro de custo', d: 'Valor apropriado a cada centro', fn: repCentro, period: true },
  { id: 'top', t: 'Itens mais requisitados', d: 'Ranking de saídas', fn: repTop, period: true },
  { id: 'sol', t: 'Solicitações e aprovações', d: 'Taxa de aprovação e tempo de resposta', fn: repSol, period: true },
  { id: 'prod', t: 'Produtividade da equipe', d: 'Movimentações por operador', fn: repProd, period: true },
  { id: 'parados', t: 'Itens sem giro', d: 'Estoque parado no período', fn: repParados, period: true },
  { id: 'criticos', t: 'Ruptura e itens críticos', d: 'O que falta e quanto comprar', fn: (data) => repCriticos(data), period: false },
  { id: 'fer-posicao', t: 'Catálogo de ferramentas', d: 'Situação atual, valor e com quem está cada uma', fn: (data) => repFerramentasPosicao(data), period: false },
  { id: 'fer-top', t: 'Ferramentas mais requisitadas', d: 'Ranking de empréstimos por ferramenta', fn: repFerramentasTop, period: true },
  { id: 'fer-setor', t: 'Empréstimos por setor', d: 'Quanto cada setor pegou emprestado', fn: repFerramentasSetor, period: true },
  { id: 'fer-atrasos', t: 'Atrasos por solicitante', d: 'Quem mais atrasa a devolução e por quanto tempo', fn: repFerramentasAtrasos, period: true },
  { id: 'ferramentas', t: 'Auditoria de ferramentas', d: 'Retiradas, devoluções e atrasos, empréstimo a empréstimo', fn: repFerramentas, period: true },
];
