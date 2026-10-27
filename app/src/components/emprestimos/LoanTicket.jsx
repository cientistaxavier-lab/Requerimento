import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { fDT } from '../../lib/format';
import { loanDisplayStatus, timeLeftLabel } from '../../lib/domain';

export default function LoanTicket({ loan, onReject }) {
  const { current } = useAuth();
  const { helpers, approveToolLoan, handoverToolLoan, returnToolLoan } = useData();
  const { show } = useToast();
  const [hours, setHours] = useState(loan.requestedHours || 4);
  const tool = helpers.findTool(loan.toolId);
  const s = loanDisplayStatus(loan);

  function doApprove() {
    const res = approveToolLoan(loan.id, current.name, hours);
    if (res.error) return show(res.error, 'err');
    show(loan.id + ' aprovado por ' + hours + ' horas.');
  }
  function doHandover() {
    const res = handoverToolLoan(loan.id, current.name);
    if (res.error) return show(res.error, 'err');
    show('Retirada de ' + (tool ? tool.name : 'ferramenta') + ' registrada. Prazo começou a contar.');
  }
  function doReturn() {
    const res = returnToolLoan(loan.id, current.name);
    if (res.error) return show(res.error, 'err');
    show('Devolução de ' + (tool ? tool.name : 'ferramenta') + ' registrada.');
  }

  let actions = null;
  if (loan.status === 'Pendente')
    actions = (
      <>
        <div className="field" style={{ marginBottom: 8 }}>
          <label htmlFor={'h-' + loan.id}>Prazo (horas)</label>
          <input id={'h-' + loan.id} type="number" min="0.5" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} style={{ width: 90 }} />
        </div>
        <button className="btn ok sm" type="button" onClick={doApprove}>
          Aprovar
        </button>{' '}
        <button className="btn danger sm" type="button" onClick={() => onReject(loan.id)}>
          Recusar
        </button>
      </>
    );
  if (loan.status === 'Aprovada')
    actions = (
      <button className="btn primary sm" type="button" onClick={doHandover}>
        Registrar retirada
      </button>
    );
  if (loan.status === 'Emprestada')
    actions = (
      <button className="btn primary sm" type="button" onClick={doReturn}>
        Registrar devolução
      </button>
    );

  return (
    <article className={'ticket st-' + s}>
      <div>
        <div className="tk-top">
          <strong>{loan.id}</strong>
          <span className={'pill p-' + s}>{s}</span>
          <span className="muted">
            {loan.requester}, {loan.sector}, {loan.cc}, {fDT(loan.ts)}
          </span>
        </div>
        <p style={{ margin: '8px 0 4px' }}>
          <b>{tool ? tool.name : 'Ferramenta'}</b> <span className="muted">{tool ? '(' + tool.patrimonio + ')' : ''}</span>
        </p>
        <p className="muted">{loan.reason || 'Sem justificativa informada.'}</p>
        {loan.status === 'Pendente' && <p className="note">Solicitado por {loan.requestedHours} horas.</p>}
        {(loan.status === 'Aprovada' || loan.status === 'Emprestada') && (
          <p className="note">
            Aprovado por {loan.decidedBy} em {fDT(loan.decidedAt)}, prazo de {loan.approvedHours} horas.
          </p>
        )}
        {loan.status === 'Emprestada' && loan.dueAt && (
          <p style={{ marginTop: 4, fontSize: 14 }}>
            Retirado em {fDT(loan.deliveredAt)}. Devolução prevista para {fDT(loan.dueAt)} ({timeLeftLabel(loan.dueAt)}).
          </p>
        )}
        {loan.status === 'Devolvida' && (
          <p style={{ marginTop: 4, fontSize: 14 }}>
            Devolvido em {fDT(loan.returnedAt)} para {loan.returnedBy}.
          </p>
        )}
        {loan.status === 'Recusada' && (
          <p style={{ marginTop: 4, fontSize: 14 }}>
            Recusado por {loan.decidedBy} em {fDT(loan.decidedAt)}. Motivo: {loan.rejectReason}
          </p>
        )}
      </div>
      {actions && <div className="tk-act">{actions}</div>}
    </article>
  );
}
