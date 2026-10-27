import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Head, Empty } from '../common/ui';
import BlockedBanner from '../common/BlockedBanner';
import { fDT } from '../../lib/format';
import { loanDisplayStatus, timeLeftLabel } from '../../lib/domain';

export default function MinhasFerramentas({ onNew }) {
  const { current } = useAuth();
  const { data, helpers } = useData();
  const loan = helpers.blockingLoan(current.name);
  const blockedTool = loan ? helpers.findTool(loan.toolId) : null;
  const mine = data.toolLoans.filter((l) => l.requester === current.name).sort((a, b) => b.ts - a.ts);

  return (
    <>
      <Head
        title="Minhas ferramentas"
        sub="Acompanhe os empréstimos de ferramenta e o prazo de devolução."
        actions={
          <button className="btn primary" type="button" onClick={onNew}>
            Solicitar ferramenta
          </button>
        }
      />
      {loan && <BlockedBanner loan={loan} toolName={blockedTool ? blockedTool.name : 'uma ferramenta'} />}
      <section className="panel">
        {mine.length ? (
          mine.map((l) => {
            const t = helpers.findTool(l.toolId);
            const s = loanDisplayStatus(l);
            return (
              <article className={'ticket st-' + s} key={l.id}>
                <div>
                  <div className="tk-top">
                    <strong>{l.id}</strong>
                    <span className={'pill p-' + s}>{s}</span>
                    <span className="muted">{fDT(l.ts)}</span>
                  </div>
                  <p style={{ margin: '8px 0 4px' }}>
                    <b>{t ? t.name : 'Ferramenta'}</b> <span className="muted">{t ? '(' + t.patrimonio + ')' : ''}</span>
                  </p>
                  {s === 'Pendente' && <p className="note">Aguardando aprovação. Prazo pedido: {l.requestedHours} horas.</p>}
                  {s === 'Aprovada' && <p className="note">Aprovado por {l.approvedHours} horas. Retire a ferramenta no almoxarifado.</p>}
                  {(s === 'Emprestada' || s === 'Atrasada') && l.dueAt && (
                    <p style={{ fontSize: 14 }}>
                      Devolução prevista para <b>{fDT(l.dueAt)}</b> ({timeLeftLabel(l.dueAt)}).
                    </p>
                  )}
                  {s === 'Devolvida' && <p style={{ fontSize: 14 }}>Devolvido em {fDT(l.returnedAt)}.</p>}
                  {s === 'Recusada' && <p style={{ fontSize: 14 }}>Motivo: {l.rejectReason}</p>}
                </div>
              </article>
            );
          })
        ) : (
          <Empty>Você ainda não pediu nenhuma ferramenta emprestada.</Empty>
        )}
      </section>
    </>
  );
}
