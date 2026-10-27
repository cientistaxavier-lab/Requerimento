import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { produce } from 'immer';
import { seed, OPERATORS, PANEL_OF } from '../data/seed';
import { pad } from '../lib/format';
import { findItem, stOf, reqValue, needsGestor as needsGestorFn, freeSlots, findTool, isUserBlocked as isUserBlockedFn, blockingLoan as blockingLoanFn } from '../lib/domain';
import { hashPw, newSalt } from '../lib/auth';

const KEY = 'almox-mvp-v3';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.items && d.movs && d.reqs && d.users && d.tools && d.toolLoans && typeof d.limit === 'number') return d;
    }
  } catch (e) {
    /* dados corrompidos ou indisponíveis: usa os dados de exemplo */
  }
  return seed();
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(load);
  const savedRef = useRef(false);

  // Persiste toda alteração de estado no navegador.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      /* localStorage indisponível (modo privado, cota cheia etc.) */
    }
  }, [data]);

  // Usuários recém-semeados trazem senha em texto puro (pw0); troca por hash na primeira carga.
  useEffect(() => {
    (async () => {
      const withPlain = data.users.filter((u) => u.pw0);
      if (!withPlain.length || savedRef.current) return;
      savedRef.current = true;
      const hashed = await Promise.all(
        withPlain.map(async (u) => {
          const salt = newSalt();
          return { user: u.user, salt, hash: await hashPw(u.pw0, salt) };
        })
      );
      setData(
        produce((draft) => {
          draft.users.forEach((u) => {
            const h = hashed.find((x) => x.user === u.user);
            if (h) {
              u.salt = h.salt;
              u.hash = h.hash;
              delete u.pw0;
            }
          });
        })
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMov = useCallback((o) => {
    let error = null;
    let crossed = null;
    flushSync(() => {
      setData(
        produce((draft) => {
          const it = draft.items.find((i) => i.id === o.itemId);
          if (!it) {
            error = 'Item não encontrado.';
            return;
          }
          if (it.qty + o.delta < 0) {
            error = 'Saldo insuficiente: há ' + it.qty + ' ' + it.unit + ' de ' + it.name + '.';
            return;
          }
          const before = it.qty;
          it.qty += o.delta;
          if (before >= it.min && it.qty < it.min) crossed = { name: it.name, qty: it.qty, min: it.min };
          draft.movs.push({
            id: 'M' + pad(draft.movs.length + 1, 4),
            ts: Date.now(),
            type: o.type,
            itemId: o.itemId,
            delta: o.delta,
            who: o.who,
            ref: o.ref || '',
            sector: o.sector || '',
            cc: o.cc || '',
            note: o.note || '',
            reqId: o.reqId || '',
          });
        })
      );
    });
    return { error, crossed };
  }, []);

  const addItem = useCallback((fields, who) => {
    const code = fields.code.trim().toUpperCase();
    if (data.items.some((i) => i.code === code)) return { error: 'Já existe um item com o código ' + code + '.' };
    const mn = parseInt(fields.min, 10);
    const mx = parseInt(fields.max, 10);
    if (isNaN(mn) || isNaN(mx) || mn < 0 || mx < 1) return { error: 'Informe mínimo e máximo válidos.' };
    if (mx < mn) return { error: 'O máximo precisa ser maior ou igual ao mínimo.' };
    const cost = parseFloat(fields.cost);
    if (isNaN(cost) || cost < 0) return { error: 'Informe um custo válido.' };
    const q = parseInt(fields.qty, 10) || 0;
    const id = 'i' + (Date.now() % 1e9);
    setData(
      produce((draft) => {
        draft.items.push({ id, code, name: fields.name.trim(), cat: fields.cat, unit: fields.unit, min: mn, max: mx, qty: 0, cost, loc: fields.loc });
        if (q > 0) {
          draft.movs.push({ id: 'M' + pad(draft.movs.length + 1, 4), ts: Date.now(), type: 'entrada', itemId: id, delta: q, who, ref: 'Saldo inicial', sector: '', cc: '', note: '' });
          const it = draft.items.find((i) => i.id === id);
          it.qty += q;
        }
      })
    );
    return { error: null, id };
  }, [data.items]);

  const editItem = useCallback((id, fields) => {
    const it = findItem(data, id);
    if (!it) return { error: 'Item não encontrado.' };
    const code = fields.code.trim().toUpperCase();
    const name = fields.name.trim();
    if (!code || !name) return { error: 'Informe o código e o nome.' };
    if (data.items.some((i) => i.id !== id && i.code === code)) return { error: 'Já existe outro item com o código ' + code + '.' };
    const mn = parseInt(fields.min, 10);
    const mx = parseInt(fields.max, 10);
    if (isNaN(mn) || isNaN(mx) || mn < 0 || mx < 1) return { error: 'Informe mínimo e máximo válidos.' };
    if (mx < mn) return { error: 'O máximo precisa ser maior ou igual ao mínimo.' };
    const cost = parseFloat(fields.cost);
    if (isNaN(cost) || cost < 0) return { error: 'Informe um custo válido.' };
    if (fields.loc !== it.loc && data.items.some((i) => i.loc === fields.loc)) return { error: 'Essa posição já está ocupada.' };
    setData(
      produce((draft) => {
        const d = draft.items.find((i) => i.id === id);
        d.code = code; d.name = name; d.cat = fields.cat; d.unit = fields.unit; d.min = mn; d.max = mx; d.cost = cost; d.loc = fields.loc;
      })
    );
    return { error: null };
  }, [data]);

  const deleteItem = useCallback((id, who) => {
    const it = findItem(data, id);
    if (!it) return { error: 'Item não encontrado.' };
    const busy = data.reqs.filter(
      (r) => (r.status === 'Pendente' || r.status === 'Aguardando gestor' || r.status === 'Aprovada') && r.items.some((l) => l.id === id)
    );
    if (busy.length) return { error: 'Item em solicitações em andamento.', busy: busy.map((r) => r.id) };
    setData(
      produce((draft) => {
        const idx = draft.items.findIndex((i) => i.id === id);
        if (idx < 0) return;
        const [removed] = draft.items.splice(idx, 1);
        removed.deletedAt = Date.now();
        removed.deletedBy = who;
        draft.archived = draft.archived || [];
        draft.archived.push(removed);
      })
    );
    return { error: null };
  }, [data]);

  const moveItem = useCallback((id, loc) => {
    const it = findItem(data, id);
    if (!it || !loc || loc === it.loc) return null;
    const from = it.loc;
    const target = data.items.find((i) => i.loc === loc);
    setData(
      produce((draft) => {
        const d = draft.items.find((i) => i.id === id);
        const t = draft.items.find((i) => i.loc === loc);
        if (t && t.id !== id) { t.loc = from; d.loc = loc; } else { d.loc = loc; }
      })
    );
    return target && target.id !== id ? { id, from, to: loc, swapId: target.id, swapName: target.name, name: it.name } : { id, from, to: loc, swapId: '', name: it.name };
  }, [data]);

  const undoMove = useCallback((move) => {
    if (!move) return false;
    let ok = false;
    flushSync(() => {
      setData(
        produce((draft) => {
          const it = draft.items.find((i) => i.id === move.id);
          const other = move.swapId ? draft.items.find((i) => i.id === move.swapId) : null;
          if (!it || it.loc !== move.to || (other && other.loc !== move.from)) return;
          ok = true;
          it.loc = move.from;
          if (other) other.loc = move.to;
        })
      );
    });
    return ok;
  }, []);

  const createRequest = useCallback((fields) => {
    if (!fields.items.length) return { error: 'Adicione ao menos um item ao pedido.' };
    const id = 'SOL-' + pad(data.reqs.length + 1, 4);
    const req = {
      id,
      ts: Date.now(),
      requester: fields.requester,
      sector: fields.sector,
      cc: fields.cc,
      urgency: fields.urgency,
      items: fields.items,
      reason: fields.reason.trim(),
      status: 'Pendente',
      l1By: '', l1At: 0,
      decidedBy: '', decidedAt: 0,
      rejectReason: '',
      deliveredAt: 0, deliveredBy: '',
    };
    setData(produce((draft) => { draft.reqs.push(req); }));
    return { error: null, req, overLimit: needsGestorFn(data, req) };
  }, [data]);

  const approveRequest = useCallback((id, who, isGestor) => {
    const r = data.reqs.find((x) => x.id === id);
    if (!r) return { error: 'Solicitação não encontrada.' };
    const short = r.items.find((l) => { const it = findItem(data, l.id); return it.qty < l.qty; });
    if (short) return { error: 'Saldo insuficiente de ' + findItem(data, short.id).name + '. Recuse o pedido ou aguarde a reposição.' };
    if (r.status === 'Pendente') {
      const over = needsGestorFn(data, r);
      if (over && !isGestor) {
        setData(produce((draft) => { const d = draft.reqs.find((x) => x.id === id); d.status = 'Aguardando gestor'; d.l1By = who; d.l1At = Date.now(); }));
        return { error: null, sentToGestor: true };
      }
      setData(produce((draft) => { const d = draft.reqs.find((x) => x.id === id); if (!d.l1By) { d.l1By = who; d.l1At = Date.now(); } d.status = 'Aprovada'; d.decidedBy = who; d.decidedAt = Date.now(); }));
      return { error: null };
    }
    if (r.status === 'Aguardando gestor') {
      if (!isGestor) return { error: 'Somente o gestor pode aprovar este pedido.' };
      setData(produce((draft) => { const d = draft.reqs.find((x) => x.id === id); d.status = 'Aprovada'; d.decidedBy = who; d.decidedAt = Date.now(); }));
      return { error: null };
    }
    return { error: 'Esta solicitação já foi decidida.' };
  }, [data]);

  const rejectRequest = useCallback((id, who, reason, isGestor) => {
    const r = data.reqs.find((x) => x.id === id);
    if (!r) return { error: 'Solicitação não encontrada.' };
    if (!reason.trim()) return { error: 'Informe o motivo da recusa.' };
    if (r.status !== 'Pendente' && !(r.status === 'Aguardando gestor' && isGestor)) return { error: 'Esta solicitação não pode mais ser recusada.' };
    setData(produce((draft) => { const d = draft.reqs.find((x) => x.id === id); d.status = 'Recusada'; d.rejectReason = reason.trim(); d.decidedBy = who; d.decidedAt = Date.now(); }));
    return { error: null };
  }, [data]);

  const deliverRequest = useCallback((id, who) => {
    const r = data.reqs.find((x) => x.id === id);
    if (!r || r.status !== 'Aprovada') return { error: 'Solicitação não está aprovada.' };
    const short = r.items.find((l) => { const it = findItem(data, l.id); return it.qty < l.qty; });
    if (short) return { error: 'Saldo insuficiente de ' + findItem(data, short.id).name + ' para entregar.' };
    const crossed = [];
    flushSync(() => {
      setData(
        produce((draft) => {
          const d = draft.reqs.find((x) => x.id === id);
          d.items.forEach((l) => {
            const it = draft.items.find((i) => i.id === l.id);
            const before = it.qty;
            it.qty -= l.qty;
            if (before >= it.min && it.qty < it.min) crossed.push({ name: it.name, qty: it.qty, min: it.min });
            draft.movs.push({ id: 'M' + pad(draft.movs.length + 1, 4), ts: Date.now(), type: 'saida', itemId: l.id, delta: -l.qty, who, ref: id, sector: d.sector, cc: d.cc, note: '', reqId: id });
          });
          d.status = 'Entregue';
          d.deliveredAt = Date.now();
          d.deliveredBy = who;
        })
      );
    });
    return { error: null, crossed };
  }, [data]);

  const addTool = useCallback((fields) => {
    const patrimonio = fields.patrimonio.trim().toUpperCase();
    if (data.tools.some((t) => t.patrimonio === patrimonio)) return { error: 'Já existe uma ferramenta com o patrimônio ' + patrimonio + '.' };
    if (!fields.name.trim()) return { error: 'Informe o nome da ferramenta.' };
    const cost = parseFloat(fields.cost);
    if (isNaN(cost) || cost < 0) return { error: 'Informe um custo válido.' };
    const id = 'tl' + (Date.now() % 1e9);
    setData(produce((draft) => { draft.tools.push({ id, patrimonio, name: fields.name.trim(), cat: fields.cat, cost, status: 'disponivel' }); }));
    return { error: null, id };
  }, [data.tools]);

  const editTool = useCallback((id, fields) => {
    const t = findTool(data, id);
    if (!t) return { error: 'Ferramenta não encontrada.' };
    const patrimonio = fields.patrimonio.trim().toUpperCase();
    const name = fields.name.trim();
    if (!patrimonio || !name) return { error: 'Informe o patrimônio e o nome.' };
    if (data.tools.some((x) => x.id !== id && x.patrimonio === patrimonio)) return { error: 'Já existe outra ferramenta com o patrimônio ' + patrimonio + '.' };
    const cost = parseFloat(fields.cost);
    if (isNaN(cost) || cost < 0) return { error: 'Informe um custo válido.' };
    setData(produce((draft) => { const d = draft.tools.find((x) => x.id === id); d.patrimonio = patrimonio; d.name = name; d.cat = fields.cat; d.cost = cost; }));
    return { error: null };
  }, [data]);

  const deleteTool = useCallback((id, who) => {
    const t = findTool(data, id);
    if (!t) return { error: 'Ferramenta não encontrada.' };
    if (t.status !== 'disponivel') return { error: 'Essa ferramenta está emprestada ou reservada. Aguarde a devolução antes de excluir.' };
    const busy = data.toolLoans.filter((l) => l.toolId === id && (l.status === 'Pendente' || l.status === 'Aprovada'));
    if (busy.length) return { error: 'Ferramenta em solicitações em andamento.', busy: busy.map((l) => l.id) };
    setData(
      produce((draft) => {
        const idx = draft.tools.findIndex((x) => x.id === id);
        if (idx < 0) return;
        const [removed] = draft.tools.splice(idx, 1);
        removed.deletedAt = Date.now();
        removed.deletedBy = who;
        draft.archivedTools = draft.archivedTools || [];
        draft.archivedTools.push(removed);
      })
    );
    return { error: null };
  }, [data]);

  const createToolLoan = useCallback((fields) => {
    if (isUserBlockedFn(data, fields.requester)) return { error: 'Você tem uma ferramenta atrasada. Devolva-a antes de fazer novos pedidos.' };
    const tool = findTool(data, fields.toolId);
    if (!tool) return { error: 'Selecione uma ferramenta.' };
    if (tool.status !== 'disponivel') return { error: 'Essa ferramenta não está disponível no momento.' };
    const hours = parseFloat(fields.hours);
    if (isNaN(hours) || hours <= 0) return { error: 'Informe por quantas horas você precisa da ferramenta.' };
    const id = 'EMP-' + pad(data.toolLoans.length + 1, 4);
    const loan = {
      id,
      toolId: tool.id,
      requester: fields.requester,
      sector: fields.sector,
      cc: fields.cc,
      reason: fields.reason.trim(),
      ts: Date.now(),
      status: 'Pendente',
      requestedHours: hours,
      approvedHours: 0,
      decidedBy: '', decidedAt: 0,
      rejectReason: '',
      deliveredAt: 0, deliveredBy: '',
      dueAt: 0,
      returnedAt: 0, returnedBy: '',
    };
    setData(produce((draft) => { draft.toolLoans.push(loan); }));
    return { error: null, loan };
  }, [data]);

  const approveToolLoan = useCallback((id, who, hours) => {
    const l = data.toolLoans.find((x) => x.id === id);
    if (!l || l.status !== 'Pendente') return { error: 'Este empréstimo não está mais pendente.' };
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) return { error: 'Informe um prazo válido, em horas.' };
    const tool = findTool(data, l.toolId);
    if (!tool || tool.status !== 'disponivel') return { error: 'Essa ferramenta não está mais disponível.' };
    setData(produce((draft) => { const d = draft.toolLoans.find((x) => x.id === id); d.status = 'Aprovada'; d.approvedHours = h; d.decidedBy = who; d.decidedAt = Date.now(); }));
    return { error: null };
  }, [data]);

  const rejectToolLoan = useCallback((id, who, reason) => {
    const l = data.toolLoans.find((x) => x.id === id);
    if (!l || l.status !== 'Pendente') return { error: 'Este empréstimo não está mais pendente.' };
    if (!reason.trim()) return { error: 'Informe o motivo da recusa.' };
    setData(produce((draft) => { const d = draft.toolLoans.find((x) => x.id === id); d.status = 'Recusada'; d.rejectReason = reason.trim(); d.decidedBy = who; d.decidedAt = Date.now(); }));
    return { error: null };
  }, [data]);

  const handoverToolLoan = useCallback((id, who) => {
    const l = data.toolLoans.find((x) => x.id === id);
    if (!l || l.status !== 'Aprovada') return { error: 'Este empréstimo não está aprovado.' };
    setData(
      produce((draft) => {
        const d = draft.toolLoans.find((x) => x.id === id);
        const now = Date.now();
        d.status = 'Emprestada';
        d.deliveredAt = now;
        d.deliveredBy = who;
        d.dueAt = now + d.approvedHours * 3600000;
        const t = draft.tools.find((x) => x.id === d.toolId);
        if (t) t.status = 'emprestada';
      })
    );
    return { error: null };
  }, [data]);

  const returnToolLoan = useCallback((id, who) => {
    const l = data.toolLoans.find((x) => x.id === id);
    if (!l || l.status !== 'Emprestada') return { error: 'Este empréstimo não está em andamento.' };
    setData(
      produce((draft) => {
        const d = draft.toolLoans.find((x) => x.id === id);
        d.status = 'Devolvida';
        d.returnedAt = Date.now();
        d.returnedBy = who;
        const t = draft.tools.find((x) => x.id === d.toolId);
        if (t) t.status = 'disponivel';
      })
    );
    return { error: null };
  }, [data]);

  const addUser = useCallback(async (fields) => {
    const uname = fields.user.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,20}$/.test(uname)) return { error: 'Usuário: de 3 a 20 caracteres, com letras minúsculas, números, ponto, hífen ou sublinhado.' };
    if (data.users.some((u) => u.user === uname)) return { error: 'Esse usuário já existe.' };
    if (!fields.name.trim()) return { error: 'Informe o nome completo.' };
    if (fields.pw.length < 6) return { error: 'A senha precisa ter ao menos 6 caracteres.' };
    const salt = newSalt();
    const hash = await hashPw(fields.pw, salt);
    setData(
      produce((draft) => {
        draft.users.push({ user: uname, name: fields.name.trim(), role: fields.role, sector: fields.role === 'solic' ? fields.sector : '', active: true, salt, hash });
      })
    );
    return { error: null };
  }, [data]);

  const resetPassword = useCallback(async (uname, pw) => {
    if (pw.length < 6) return { error: 'A senha precisa ter ao menos 6 caracteres.' };
    const salt = newSalt();
    const hash = await hashPw(pw, salt);
    setData(produce((draft) => { const u = draft.users.find((x) => x.user === uname); if (u) { u.salt = salt; u.hash = hash; } }));
    return { error: null };
  }, []);

  const changeOwnPassword = useCallback(async (uname, oldPw, newPw, newPw2) => {
    const u = data.users.find((x) => x.user === uname);
    if (!u) return { error: 'Usuário não encontrado.' };
    if ((await hashPw(oldPw, u.salt)) !== u.hash) return { error: 'A senha atual está incorreta.' };
    if (newPw.length < 6) return { error: 'A nova senha precisa ter ao menos 6 caracteres.' };
    if (newPw !== newPw2) return { error: 'As duas senhas novas não são iguais.' };
    const salt = newSalt();
    const hash = await hashPw(newPw, salt);
    setData(produce((draft) => { const d = draft.users.find((x) => x.user === uname); d.salt = salt; d.hash = hash; }));
    return { error: null };
  }, [data]);

  const toggleUser = useCallback((uname, currentUser) => {
    const u = data.users.find((x) => x.user === uname);
    if (!u || u.user === currentUser) return { error: null };
    if (u.active && u.role === 'gestor' && data.users.filter((x) => x.role === 'gestor' && x.active).length < 2) {
      return { error: 'É preciso manter ao menos um gestor ativo.' };
    }
    setData(produce((draft) => { const d = draft.users.find((x) => x.user === uname); d.active = !d.active; }));
    return { error: null, active: !u.active };
  }, [data]);

  const setUserTheme = useCallback((uname, themeId) => {
    setData(produce((draft) => { const u = draft.users.find((x) => x.user === uname); if (u) u.theme = themeId; }));
  }, []);

  const setLimit = useCallback((v) => {
    if (isNaN(v) || v < 0) return { error: 'Informe um valor válido.' };
    setData(produce((draft) => { draft.limit = v; }));
    return { error: null };
  }, []);

  const resetDemo = useCallback(() => {
    setData((prev) => {
      const fresh = seed();
      fresh.users = prev.users;
      fresh.limit = prev.limit;
      return fresh;
    });
  }, []);

  const value = {
    data,
    addMov, addItem, editItem, deleteItem, moveItem, undoMove,
    createRequest, approveRequest, rejectRequest, deliverRequest,
    addTool, editTool, deleteTool, createToolLoan, approveToolLoan, rejectToolLoan, handoverToolLoan, returnToolLoan,
    addUser, resetPassword, changeOwnPassword, toggleUser, setUserTheme, setLimit, resetDemo,
    helpers: {
      findItem: (id) => findItem(data, id),
      stOf,
      reqValue: (r) => reqValue(data, r),
      needsGestor: (r) => needsGestorFn(data, r),
      freeSlots: () => freeSlots(data),
      findTool: (id) => findTool(data, id),
      isUserBlocked: (name) => isUserBlockedFn(data, name),
      blockingLoan: (name) => blockingLoanFn(data, name),
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData precisa estar dentro de <DataProvider>');
  return ctx;
}

export { OPERATORS, PANEL_OF };
