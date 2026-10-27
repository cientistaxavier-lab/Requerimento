import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast, crossedMessage } from '../../context/ToastContext';
import { Head, Empty } from '../common/ui';
import { fDT } from '../../lib/format';
import { CATS, SECTORS } from '../../data/seed';

const TYPE_LABEL = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' };
const TYPE_PILL = { entrada: 'p-ok', saida: 'p-info', ajuste: 'p-wait' };

export default function Movimentacoes() {
  const { current } = useAuth();
  const { data, addMov, helpers } = useData();
  const { show } = useToast();
  const [type, setType] = useState('entrada');
  const [itemId, setItemId] = useState('');
  const [qty, setQty] = useState('');
  const [mt, setMt] = useState('');

  const it = itemId ? helpers.findItem(itemId) : null;

  function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    if (!it) return show('Selecione o item.', 'err');
    const q = parseInt(f.qty.value, 10);
    if (isNaN(q) || q < 0 || (type !== 'ajuste' && q < 1)) return show('Informe uma quantidade válida.', 'err');
    const delta = type === 'entrada' ? q : type === 'saida' ? -q : q - it.qty;
    if (type === 'ajuste' && delta === 0) return show('A contagem é igual ao saldo. Nenhum ajuste necessário.', 'err');
    const res = addMov({
      type,
      itemId,
      delta,
      who: current.name,
      ref: type === 'entrada' ? f.ref.value : '',
      sector: type === 'saida' ? f.sector.value : '',
      note: f.note.value,
    });
    if (res.error) return show(res.error, 'err');
    const { msg, kind } = crossedMessage({ entrada: 'Entrada registrada.', saida: 'Saída registrada.', ajuste: 'Ajuste registrado.' }[type], res.crossed ? [res.crossed] : null);
    show(msg, kind);
    setQty('');
    f.reset();
    setType('entrada');
  }

  const hint = it
    ? 'Saldo atual: ' + it.qty + ' ' + it.unit + ' (mínimo ' + it.min + ', máximo ' + it.max + ').' +
      (type === 'saida' && parseInt(qty, 10) > it.qty ? ' A quantidade informada é maior que o saldo.' : '') +
      (type === 'ajuste' && qty !== '' ? ' Ajuste de ' + (parseInt(qty, 10) - it.qty > 0 ? '+' : '') + (parseInt(qty, 10) - it.qty) + ' ' + it.unit + '.' : '')
    : '';

  const log = useMemo(() => data.movs.filter((m) => !mt || m.type === mt).slice().reverse().slice(0, 50), [data.movs, mt]);

  return (
    <>
      <Head title="Movimentações" sub="Registre o que entra, o que sai e os acertos de inventário. Cada lançamento atualiza o saldo na hora." />
      <div className="two">
        <section className="panel">
          <header>
            <h2>Novo lançamento</h2>
          </header>
          <form className="body fgrid" onSubmit={onSubmit}>
            <div className="field full">
              <span className="lbl">Tipo</span>
              <div className="seg" role="radiogroup" aria-label="Tipo de movimentação">
                {[
                  ['entrada', 'Entrada'],
                  ['saida', 'Saída'],
                  ['ajuste', 'Ajuste'],
                ].map(([v, l]) => (
                  <label className="rd" key={v}>
                    <input type="radio" name="type" value={v} checked={type === v} onChange={() => setType(v)} />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="field full">
              <label htmlFor="mv-item">Item</label>
              <select id="mv-item" name="itemId" required value={itemId} onChange={(e) => setItemId(e.target.value)}>
                <option value="">Selecione o item</option>
                {CATS.map((c) => (
                  <optgroup label={c} key={c}>
                    {data.items
                      .filter((i) => i.cat === c)
                      .sort((a, b) => a.code.localeCompare(b.code))
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.code} {i.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="mv-qty">{type === 'ajuste' ? 'Contagem física' : 'Quantidade'}</label>
              <input id="mv-qty" name="qty" type="number" min="0" step="1" required value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="mv-who">Responsável</label>
              <input id="mv-who" value={current.name} readOnly />
            </div>
            {type === 'entrada' && (
              <div className="field full">
                <label htmlFor="mv-ref">Documento (nota fiscal ou pedido)</label>
                <input id="mv-ref" name="ref" type="text" placeholder="Ex.: NF 4521" />
              </div>
            )}
            {type === 'saida' && (
              <div className="field full">
                <label htmlFor="mv-sec">Setor de destino</label>
                <select id="mv-sec" name="sector" defaultValue={SECTORS[0]}>
                  {SECTORS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="field full">
              <label htmlFor="mv-note">Observação</label>
              <textarea id="mv-note" name="note" placeholder="Opcional" />
            </div>
            <p className="hint full">{hint}</p>
            <div className="full">
              <button className="btn primary" type="submit">
                Registrar {type === 'ajuste' ? 'ajuste' : type === 'entrada' ? 'entrada' : 'saída'}
              </button>
            </div>
          </form>
        </section>
        <section className="panel">
          <header>
            <h2>Histórico</h2>
            <select aria-label="Filtrar por tipo" value={mt} onChange={(e) => setMt(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
              <option value="ajuste">Ajustes</option>
            </select>
          </header>
          {log.length ? (
            <>
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Item</th>
                      <th className="n">Qtd.</th>
                      <th>Responsável</th>
                      <th>Documento ou setor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {log.map((m) => {
                      const mi = helpers.findItem(m.itemId);
                      return (
                        <tr key={m.id}>
                          <td>{fDT(m.ts)}</td>
                          <td>
                            <span className={'pill ' + TYPE_PILL[m.type]}>{TYPE_LABEL[m.type]}</span>
                          </td>
                          <td>{mi.name}</td>
                          <td className="n">
                            {m.delta > 0 ? '+' : ''}
                            {m.delta} {mi.unit}
                          </td>
                          <td>{m.who}</td>
                          <td>{[m.sector, m.ref, m.note].filter(Boolean).join(', ')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="foot muted">Mostrando as 50 movimentações mais recentes.</div>
            </>
          ) : (
            <Empty>Nenhuma movimentação registrada.</Empty>
          )}
        </section>
      </div>
    </>
  );
}
