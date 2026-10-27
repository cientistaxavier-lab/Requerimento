import { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { SECTORS } from '../../data/seed';

export default function NewUserModal({ open, onClose }) {
  const { addUser } = useData();
  const { show } = useToast();
  const [role, setRole] = useState('solic');

  async function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    const res = await addUser({ user: f.user.value, name: f.name.value, role, sector: role === 'solic' ? f.sector.value : '', pw: f.pw.value });
    if (res.error) return show(res.error, 'err');
    show('Usuário ' + f.user.value.trim().toLowerCase() + ' criado.');
    setRole('solic');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <>
          <div className="dh">
            <div>
              <h2>Novo usuário</h2>
              <span className="muted">A pessoa poderá entrar no painel do perfil escolhido.</span>
            </div>
            <button className="x" type="button" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </div>
          <form className="dbody fgrid" onSubmit={onSubmit} autoComplete="off">
            <div className="field">
              <label htmlFor="nu-user">Usuário (login)</label>
              <input id="nu-user" name="user" required autoCapitalize="off" spellCheck="false" />
            </div>
            <div className="field">
              <label htmlFor="nu-name">Nome completo</label>
              <input id="nu-name" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="nu-role">Perfil</label>
              <select id="nu-role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="solic">Solicitante</option>
                <option value="almox">Almoxarife</option>
                <option value="gestor">Gestor do almoxarifado</option>
              </select>
            </div>
            {role === 'solic' && (
              <div className="field">
                <label htmlFor="nu-sec">Setor</label>
                <select id="nu-sec" name="sector">
                  {SECTORS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="field full">
              <label htmlFor="nu-pw">Senha inicial (mínimo 6 caracteres)</label>
              <input id="nu-pw" name="pw" type="password" minLength={6} required autoComplete="new-password" />
            </div>
            <div className="dfoot full">
              <button type="button" className="btn" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn primary" type="submit">
                Criar usuário
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
