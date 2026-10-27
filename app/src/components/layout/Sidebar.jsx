import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ROLES } from '../../data/seed';
import { NAV } from '../../lib/nav';
import { Icon, Logo } from '../common/icons';
import { loanDisplayStatus } from '../../lib/domain';

export default function Sidebar({ view, setView }) {
  const { current, isGestor, logout } = useAuth();
  const { data } = useData();

  const pend = data.reqs.filter((r) => r.status === 'Pendente' || (isGestor && r.status === 'Aguardando gestor')).length;
  const low = data.items.filter((i) => i.qty <= 0 || i.qty < i.min).length;
  const mine = data.reqs.filter(
    (r) => r.requester === current.name && (r.status === 'Pendente' || r.status === 'Aguardando gestor' || r.status === 'Aprovada')
  ).length;
  const loanPend = data.toolLoans.filter((l) => l.status === 'Pendente' || loanDisplayStatus(l) === 'Atrasada').length;
  const mineLoans = data.toolLoans.filter(
    (l) => l.requester === current.name && (l.status === 'Pendente' || l.status === 'Aprovada' || l.status === 'Emprestada')
  ).length;
  const badge = { solic: pend, repos: low, minhas: mine, emprestimos: loanPend, 'minhas-ferramentas': mineLoans };

  return (
    <aside className="side">
      <div className="brand">
        <Logo />
        <div>
          <div className="bn">Almoxarifado Digital</div>
          <div className="bs">Protótipo (MVP)</div>
        </div>
      </div>
      <nav className="nav" aria-label="Principal">
        {NAV[current.role].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined}>
            <Icon name={id} />
            <span>{label}</span>
            {!!badge[id] && <span className="badge">{badge[id]}</span>}
          </button>
        ))}
      </nav>
      <div className="prof">
        <div className="ucard">
          <b>{current.name}</b>
          <small>{current.role === 'solic' ? 'Solicitante, ' + current.sector : ROLES[current.role]}</small>
        </div>
        <button className="lnk" type="button" onClick={() => setView('config')}>
          Alterar minha senha
        </button>
        <button
          className="btn sm"
          type="button"
          onClick={() => logout()}
          style={{ alignSelf: 'flex-start', background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
