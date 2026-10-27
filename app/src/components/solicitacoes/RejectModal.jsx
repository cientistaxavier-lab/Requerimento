import { useRef } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function RejectModal({ reqId, onClose }) {
  const { current, isGestor } = useAuth();
  const { rejectRequest } = useData();
  const { show } = useToast();
  const ref = useRef(null);

  function onSubmit(e) {
    e.preventDefault();
    const reason = e.target.elements.reason.value;
    const res = rejectRequest(reqId, current.name, reason, isGestor);
    if (res.error) {
      show(res.error, 'err');
      return;
    }
    show(reqId + ' recusada.');
    onClose();
  }

  return (
    <Modal open={!!reqId} onClose={onClose}>
      <div className="dh">
        <div>
          <h2>Recusar {reqId}</h2>
          <span className="muted">O solicitante verá o motivo.</span>
        </div>
        <button className="x" type="button" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>
      <form className="dbody" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="rj">Motivo da recusa</label>
          <textarea id="rj" name="reason" required ref={ref} autoFocus placeholder="Ex.: quantidade acima da cota do setor" />
        </div>
        <div className="dfoot">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn danger" type="submit">
            Recusar solicitação
          </button>
        </div>
      </form>
    </Modal>
  );
}
