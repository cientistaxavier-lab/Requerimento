import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Head } from '../common/ui';
import BlockedBanner from '../common/BlockedBanner';
import { CCS } from '../../data/seed';
import { CCOF } from '../../lib/domain';

export default function SolicitarFerramenta({ onSent }) {
  const { current } = useAuth();
  const { data, createToolLoan, helpers } = useData();
  const { show } = useToast();
  const [toolId, setToolId] = useState('');
  const [hours, setHours] = useState(4);

  const loan = helpers.blockingLoan(current.name);
  const blockedTool = loan ? helpers.findTool(loan.toolId) : null;
  const available = data.tools.filter((t) => t.status === 'disponivel').sort((a, b) => a.name.localeCompare(b.name));

  function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    const res = createToolLoan({ requester: current.name, sector: current.sector, cc: f.cc.value, toolId, hours, reason: f.reason.value });
    if (res.error) return show(res.error, 'err');
    setToolId('');
    setHours(4);
    show('Pedido de empréstimo ' + res.loan.id + ' enviado.');
    onSent();
  }

  return (
    <>
      <Head title="Solicitar ferramenta" sub="Peça uma ferramenta emprestada. Ela precisa ser devolvida dentro do prazo combinado com o almoxarifado." />
      {loan && <BlockedBanner loan={loan} toolName={blockedTool ? blockedTool.name : 'uma ferramenta'} />}
      {!loan && (
        <div className="two" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
          <section className="panel" style={{ maxWidth: 760 }}>
            <header>
              <h2>Dados do pedido</h2>
            </header>
            <form className="body fgrid" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="tf-name">Solicitante</label>
                <input id="tf-name" value={current.name} readOnly />
              </div>
              <div className="field">
                <label htmlFor="tf-cc">Centro de custo</label>
                <select id="tf-cc" name="cc" defaultValue={CCOF[current.sector]}>
                  {CCS.map((c) => (
                    <option key={c[0]} value={c[0]}>
                      {c[0]} {c[1]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field full">
                <label htmlFor="tf-tool">Ferramenta</label>
                <select id="tf-tool" value={toolId} onChange={(e) => setToolId(e.target.value)} required>
                  <option value="">Selecione a ferramenta</option>
                  {available.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.patrimonio})
                    </option>
                  ))}
                </select>
                {!available.length && <p className="hint">Nenhuma ferramenta disponível no momento.</p>}
              </div>
              <div className="field">
                <label htmlFor="tf-hours">Por quantas horas você precisa?</label>
                <input id="tf-hours" type="number" min="0.5" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} required />
                <span className="hint">O almoxarifado pode ajustar esse prazo ao aprovar.</span>
              </div>
              <div className="field full">
                <label htmlFor="tf-reason">Para que precisa da ferramenta?</label>
                <textarea id="tf-reason" name="reason" placeholder="Ex.: solda emergencial no portão da doca" />
              </div>
              <div className="full">
                <button className="btn primary" type="submit" disabled={!available.length}>
                  Enviar pedido
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
