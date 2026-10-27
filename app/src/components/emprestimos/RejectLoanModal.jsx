import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function RejectLoanModal({ loanId, onClose }) {
  const { current } = useAuth();
  const { rejectToolLoan } = useData();
  const { show } = useToast();

  function onSubmit(e) {
    e.preventDefault();
    const reason = e.target.elements.reason.value;
    const res = rejectToolLoan(loanId, current.name, reason);
    if (res.error) {
      show(res.error, 'err');
      return;
    }
    show(loanId + ' recusado.');
    onClose();
  }

  return (
    <Modal open={!!loanId} onClose={onClose}>
      <div className="dh">
        <div>
          <h2>Recusar {loanId}</h2>
          <span className="muted">O solicitante verá o motivo.</span>
        </div>
        <button className="x" type="button" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>
      <form className="dbody" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="rjl">Motivo da recusa</label>
          <textarea id="rjl" name="reason" required autoFocus placeholder="Ex.: ferramenta reservada para manutenção programada" />
        </div>
        <div className="dfoot">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn danger" type="submit">
            Recusar empréstimo
          </button>
        </div>
      </form>
    </Modal>
  );
}
