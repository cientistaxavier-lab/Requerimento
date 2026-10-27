import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast, crossedMessage } from '../../context/ToastContext';
import { fDT, brl } from '../../lib/format';
import { rsClass } from '../../lib/domain';

function Steps({ req }) {
  const { helpers } = useData();
  if (req.status === 'Recusada') {
    return (
      <div className="steps">
        <span className="on">Enviada</span>
        <span className="bad">Recusada</span>
      </div>
    );
  }
  const l2 = helpers.needsGestor(req) || req.status === 'Aguardando gestor';
  const labels = ['Enviada'].concat(l2 ? ['Aguardando gestor'] : [], ['Aprovada', 'Entregue']);
  const idx = l2
    ? { Pendente: 0, 'Aguardando gestor': 1, Aprovada: 2, Entregue: 3 }[req.status]
    : { Pendente: 0, Aprovada: 1, Entregue: 2 }[req.status];
  return (
    <div className="steps">
      {labels.map((l, i) => (
        <span key={l} className={i <= idx ? 'on' : ''}>
          {l}
        </span>
      ))}
    </div>
  );
}

export default function Ticket({ req, mode, onReject }) {
  const { current, isGestor } = useAuth();
  const { data, helpers, approveRequest, deliverRequest } = useData();
  const { show } = useToast();
  const open = req.status === 'Pendente' || req.status === 'Aguardando gestor' || req.status === 'Aprovada';
  const val = helpers.reqValue(req);
  const over = helpers.needsGestor(req);

  function handleApprove() {
    const res = approveRequest(req.id, current.name, isGestor);
    if (res.error) show(res.error, 'err');
    else show(res.sentToGestor ? req.id + ' conferida e enviada ao gestor para a segunda aprovação.' : req.id + ' aprovada.');
  }
  function handleDeliver() {
    const res = deliverRequest(req.id, current.name);
    if (res.error) show(res.error, 'err');
    else {
      const { msg, kind } = crossedMessage('Entrega de ' + req.id + ' registrada e estoque atualizado.', res.crossed);
      show(msg, kind);
    }
  }

  let dec = '';
  if (req.status === 'Aguardando gestor') dec = 'Conferida por ' + req.l1By + ' em ' + fDT(req.l1At) + '. Aguardando a aprovação do gestor.';
  if (req.status === 'Aprovada') dec = 'Aprovada por ' + req.decidedBy + ' em ' + fDT(req.decidedAt) + '. Aguardando entrega.';
  if (req.status === 'Entregue') dec = 'Entregue em ' + fDT(req.deliveredAt) + ' por ' + req.deliveredBy + '.';
  if (req.status === 'Recusada') dec = 'Recusada por ' + req.decidedBy + ' em ' + fDT(req.decidedAt) + '. Motivo: ' + req.rejectReason;

  let actions = null;
  if (mode === 'admin' && current.role !== 'solic') {
    if (req.status === 'Pendente')
      actions = (
        <>
          <button className="btn ok sm" type="button" onClick={handleApprove}>
            {over && !isGestor ? 'Enviar ao gestor' : 'Aprovar'}
          </button>
          <button className="btn danger sm" type="button" onClick={() => onReject(req.id)}>
            Recusar
          </button>
        </>
      );
    if (req.status === 'Aguardando gestor' && isGestor)
      actions = (
        <>
          <button className="btn ok sm" type="button" onClick={handleApprove}>
            Aprovar
          </button>
          <button className="btn danger sm" type="button" onClick={() => onReject(req.id)}>
            Recusar
          </button>
        </>
      );
    if (req.status === 'Aprovada')
      actions = (
        <button className="btn primary sm" type="button" onClick={handleDeliver}>
          Registrar entrega
        </button>
      );
  }

  return (
    <article className={'ticket st-' + req.status.replace(/ /g, '-')}>
      <div>
        <div className="tk-top">
          <strong>{req.id}</strong>
          <span className={'pill ' + rsClass[req.status]}>{req.status}</span>
          {req.urgency === 'Urgente' && <span className="pill p-urg">Urgente</span>}
          <span className="muted">
            {req.requester}, {req.sector}, {req.cc}, {fDT(req.ts)}
          </span>
        </div>
        <ul className="tk-items">
          {req.items.map((l) => {
            const it = helpers.findItem(l.id);
            const ok = it.qty >= l.qty;
            return (
              <li key={l.id}>
                <span>{it.name}</span>
                <span className="qt">
                  {l.qty} {it.unit}
                </span>
                {open && mode === 'admin' ? (
                  <span className={'pill ' + (ok ? 'p-ok' : 'p-out')}>{ok ? 'saldo ' + it.qty : 'faltam ' + (l.qty - it.qty)}</span>
                ) : (
                  <span />
                )}
              </li>
            );
          })}
        </ul>
        <p className="note">
          Valor estimado: {brl(val)}
          {over && open ? '. Acima de ' + brl(data.limit) + ', exige aprovação do gestor.' : ''}
        </p>
        <p className="muted" style={{ marginTop: 4 }}>
          {req.reason || 'Sem justificativa informada.'}
        </p>
        {dec && <p style={{ marginTop: 6, fontSize: 14 }}>{dec}</p>}
        {mode === 'mine' && <Steps req={req} />}
      </div>
      {actions && <div className="tk-act">{actions}</div>}
    </article>
  );
}
