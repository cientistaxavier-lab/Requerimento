import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function MyPasswordModal({ open, onClose }) {
  const { current } = useAuth();
  const { changeOwnPassword } = useData();
  const { show } = useToast();

  async function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    const res = await changeOwnPassword(current.user, f.old.value, f.pw.value, f.pw2.value);
    if (res.error) return show(res.error, 'err');
    show('Senha alterada.');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <>
          <div className="dh">
            <div>
              <h2>Alterar minha senha</h2>
            </div>
            <button className="x" type="button" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </div>
          <form className="dbody fgrid" onSubmit={onSubmit}>
            <div className="field full">
              <label htmlFor="mp-old">Senha atual</label>
              <input id="mp-old" name="old" type="password" required autoComplete="current-password" />
            </div>
            <div className="field">
              <label htmlFor="mp-new">Nova senha</label>
              <input id="mp-new" name="pw" type="password" minLength={6} required autoComplete="new-password" />
            </div>
            <div className="field">
              <label htmlFor="mp-new2">Repita a nova senha</label>
              <input id="mp-new2" name="pw2" type="password" minLength={6} required autoComplete="new-password" />
            </div>
            <div className="dfoot full">
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
