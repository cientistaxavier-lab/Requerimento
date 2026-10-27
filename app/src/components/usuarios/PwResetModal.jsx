import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function PwResetModal({ uname, onClose }) {
  const { data, resetPassword } = useData();
  const { show } = useToast();
  const u = uname ? data.users.find((x) => x.user === uname) : null;

  async function onSubmit(e) {
    e.preventDefault();
    const res = await resetPassword(uname, e.target.elements.pw.value);
    if (res.error) return show(res.error, 'err');
    show('Senha de ' + uname + ' redefinida.');
    onClose();
  }

  return (
    <Modal open={!!(uname && u)} onClose={onClose}>
      {u && (
        <>
          <div className="dh">
            <div>
              <h2>Redefinir senha</h2>
              <span className="muted">
                {u.name} ({u.user})
              </span>
            </div>
            <button className="x" type="button" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </div>
          <form className="dbody" onSubmit={onSubmit} autoComplete="off">
            <div className="field">
              <label htmlFor="pr-pw">Nova senha (mínimo 6 caracteres)</label>
              <input id="pr-pw" name="pw" type="password" minLength={6} required autoComplete="new-password" />
            </div>
            <div className="dfoot">
              <button type="button" className="btn" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn primary" type="submit">
                Salvar senha
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
