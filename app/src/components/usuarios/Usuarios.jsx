import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Head } from '../common/ui';
import { ROLES } from '../../data/seed';
import NewUserModal from './NewUserModal';
import PwResetModal from './PwResetModal';

const ORDER = { gestor: 0, almox: 1, solic: 2 };

export default function Usuarios() {
  const { current } = useAuth();
  const { data, toggleUser, setLimit, resetDemo } = useData();
  const { show } = useToast();
  const [newOpen, setNewOpen] = useState(false);
  const [pwUser, setPwUser] = useState(null);

  const rows = [...data.users].sort((a, b) => ORDER[a.role] - ORDER[b.role] || a.name.localeCompare(b.name));

  function onToggle(u) {
    const res = toggleUser(u.user, current.user);
    if (res.error) return show(res.error, 'err');
    show('Usuário ' + u.user + (res.active ? ' ativado.' : ' bloqueado.'));
  }

  function onLimit(e) {
    e.preventDefault();
    const v = parseFloat(e.target.elements.limit.value);
    const res = setLimit(v);
    if (res.error) return show(res.error, 'err');
    show('Regra salva: pedidos acima de ' + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) + ' passam pelo gestor.');
  }

  function onReset() {
    if (!window.confirm('Apagar os dados feitos neste navegador e voltar aos dados de exemplo? Usuários e senhas não mudam.')) return;
    resetDemo();
    show('Dados de exemplo restaurados.');
  }

  return (
    <>
      <Head
        title="Usuários e regras"
        sub="Quem pode entrar em cada painel e a partir de que valor um pedido exige a aprovação do gestor."
        actions={
          <button className="btn primary" type="button" onClick={() => setNewOpen(true)}>
            Novo usuário
          </button>
        }
      />
      <section className="panel">
        <header>
          <h2>Usuários</h2>
          <span className="muted">{data.users.length} cadastrados</span>
        </header>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Nome</th>
                <th>Perfil</th>
                <th>Setor</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.user}>
                  <td>
                    <span className="code">{u.user}</span>
                  </td>
                  <td>{u.name}</td>
                  <td>{ROLES[u.role]}</td>
                  <td>{u.sector || '-'}</td>
                  <td>{u.active ? <span className="pill p-ok">Ativo</span> : <span className="pill p-out">Bloqueado</span>}</td>
                  <td className="ac">
                    <button className="btn sm" type="button" onClick={() => setPwUser(u.user)}>
                      Redefinir senha
                    </button>{' '}
                    {u.user !== current.user && (
                      <button className="btn sm" type="button" onClick={() => onToggle(u)}>
                        {u.active ? 'Bloquear' : 'Ativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="grid2">
        <section className="panel">
          <header>
            <h2>Regra de aprovação</h2>
          </header>
          <form className="body" onSubmit={onLimit}>
            <p className="muted" style={{ marginBottom: 12 }}>
              Pedidos com valor estimado acima do limite são conferidos pelo almoxarife e depois aprovados pelo gestor. Abaixo do limite, o almoxarife aprova sozinho.
            </p>
            <div className="field">
              <label htmlFor="lim">Valor limite (R$)</label>
              <input id="lim" name="limit" type="number" min="0" step="10" defaultValue={data.limit} required />
            </div>
            <div className="dfoot" style={{ justifyContent: 'flex-start' }}>
              <button className="btn primary" type="submit">
                Salvar regra
              </button>
            </div>
          </form>
        </section>
        <section className="panel">
          <header>
            <h2>Dados de demonstração</h2>
          </header>
          <div className="body">
            <p className="muted" style={{ marginBottom: 12 }}>
              Apaga itens, lançamentos e solicitações feitos neste navegador e volta aos dados de exemplo. Usuários e senhas não mudam.
            </p>
            <button className="btn danger" type="button" onClick={onReset}>
              Restaurar dados de exemplo
            </button>
          </div>
        </section>
      </div>
      <NewUserModal open={newOpen} onClose={() => setNewOpen(false)} />
      <PwResetModal uname={pwUser} onClose={() => setPwUser(null)} />
    </>
  );
}
