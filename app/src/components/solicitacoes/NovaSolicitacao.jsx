import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Head } from '../common/ui';
import BlockedBanner from '../common/BlockedBanner';
import { CATS, CCS } from '../../data/seed';
import { stOf, CCOF } from '../../lib/domain';

export default function NovaSolicitacao({ onSent }) {
  const { current } = useAuth();
  const { data, createRequest, helpers } = useData();
  const { show } = useToast();
  const blockingLoan = helpers.blockingLoan(current.name);
  const blockedTool = blockingLoan ? helpers.findTool(blockingLoan.toolId) : null;
  const [lines, setLines] = useState([]);
  const [urg, setUrg] = useState('Normal');
  const [itemSel, setItemSel] = useState('');
  const [qty, setQty] = useState('');

  function addLine() {
    if (!itemSel) {
      show('Selecione um item.', 'err');
      return;
    }
    const q = parseInt(qty, 10);
    if (!(q > 0)) {
      show('Informe uma quantidade maior que zero.', 'err');
      return;
    }
    setLines((prev) => {
      const ex = prev.find((l) => l.id === itemSel);
      if (ex) return prev.map((l) => (l.id === itemSel ? { ...l, qty: l.qty + q } : l));
      return [...prev, { id: itemSel, qty: q }];
    });
    setItemSel('');
    setQty('');
  }

  function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    const res = createRequest({
      requester: current.name,
      sector: current.sector,
      cc: f.cc.value,
      urgency: urg,
      items: lines,
      reason: f.reason.value,
    });
    if (res.error) {
      show(res.error, 'err');
      return;
    }
    setLines([]);
    setUrg('Normal');
    show('Solicitação ' + res.req.id + ' enviada.' + (res.overLimit ? ' Pedido acima do limite: passará por duas aprovações.' : ''));
    onSent();
  }

  return (
    <>
      <Head title="Nova solicitação" sub="Peça o material que precisa. O almoxarifado analisa e você acompanha a resposta em Minhas solicitações." />
      {blockingLoan && <BlockedBanner loan={blockingLoan} toolName={blockedTool ? blockedTool.name : 'uma ferramenta'} />}
      {!blockingLoan && <NovaForm
        current={current}
        lines={lines}
        setLines={setLines}
        urg={urg}
        setUrg={setUrg}
        itemSel={itemSel}
        setItemSel={setItemSel}
        qty={qty}
        setQty={setQty}
        addLine={addLine}
        onSubmit={onSubmit}
        data={data}
        helpers={helpers}
      />}
    </>
  );
}

function NovaForm({ current, lines, setLines, urg, setUrg, itemSel, setItemSel, qty, setQty, addLine, onSubmit, data, helpers }) {
  return (
    <div className="two" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
      <section className="panel" style={{ maxWidth: 760 }}>
        <header>
          <h2>Dados do pedido</h2>
        </header>
        <form className="body fgrid" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="n-name">Solicitante</label>
            <input id="n-name" value={current.name} readOnly />
          </div>
          <div className="field">
            <label htmlFor="n-sec">Setor</label>
            <input id="n-sec" value={current.sector} readOnly />
          </div>
          <div className="field">
            <label htmlFor="n-cc">Centro de custo</label>
            <select id="n-cc" name="cc" defaultValue={CCOF[current.sector]}>
              {CCS.map((c) => (
                <option key={c[0]} value={c[0]}>
                  {c[0]} {c[1]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <span className="lbl">Urgência</span>
            <div className="seg" role="radiogroup" aria-label="Urgência">
              <label className="rd">
                <input type="radio" name="urg" value="Normal" checked={urg === 'Normal'} onChange={() => setUrg('Normal')} />
                <span>Normal</span>
              </label>
              <label className="rd">
                <input type="radio" name="urg" value="Urgente" checked={urg === 'Urgente'} onChange={() => setUrg('Urgente')} />
                <span>Urgente</span>
              </label>
            </div>
          </div>
          <div className="field full">
            <label htmlFor="ln-item">Adicionar item</label>
            <div className="addrow">
              <select id="ln-item" value={itemSel} onChange={(e) => setItemSel(e.target.value)}>
                <option value="">Selecione o item</option>
                {CATS.map((c) => (
                  <optgroup label={c} key={c}>
                    {data.items
                      .filter((i) => i.cat === c)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((i) => {
                        const s = stOf(i);
                        const tag = s === 'out' ? 'indisponível' : s === 'low' ? 'pouco estoque' : 'disponível';
                        return (
                          <option key={i.id} value={i.id} disabled={s === 'out'}>
                            {i.name} ({i.unit}), {tag}
                          </option>
                        );
                      })}
                  </optgroup>
                ))}
              </select>
              <input id="ln-qty" type="number" min="1" step="1" placeholder="Qtd." aria-label="Quantidade" value={qty} onChange={(e) => setQty(e.target.value)} />
              <button type="button" className="btn" onClick={addLine}>
                Adicionar
              </button>
            </div>
          </div>
          <div className="full">
            {lines.length ? (
              <ul className="lines">
                {lines.map((l, i) => {
                  const it = helpers.findItem(l.id);
                  return (
                    <li key={l.id}>
                      <span>{it.name}</span>
                      <span>
                        <b>{l.qty}</b> {it.unit}{' '}
                        <button type="button" className="link" onClick={() => setLines(lines.filter((_, idx) => idx !== i))} aria-label={'Remover ' + it.name}>
                          Remover
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted">Nenhum item adicionado ainda.</p>
            )}
          </div>
          <div className="field full">
            <label htmlFor="n-reason">Para que precisa do material?</label>
            <textarea id="n-reason" name="reason" placeholder="Ex.: troca de iluminação do galpão 2" />
          </div>
          <div className="full">
            <button className="btn primary" type="submit">
              Enviar solicitação
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
