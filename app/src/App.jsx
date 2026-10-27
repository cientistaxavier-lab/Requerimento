import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { NAV } from './lib/nav';
import LoginScreen from './components/login/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Estoque from './components/estoque/Estoque';
import Movimentacoes from './components/movimentacoes/Movimentacoes';
import Solicitacoes from './components/solicitacoes/Solicitacoes';
import NovaSolicitacao from './components/solicitacoes/NovaSolicitacao';
import MinhasSolicitacoes from './components/solicitacoes/MinhasSolicitacoes';
import Reposicao from './components/reposicao/Reposicao';
import Relatorios from './components/relatorios/Relatorios';
import Config from './components/config/Config';
import Usuarios from './components/usuarios/Usuarios';
import Ferramentas from './components/ferramentas/Ferramentas';
import Emprestimos from './components/emprestimos/Emprestimos';
import SolicitarFerramenta from './components/ferramentas/SolicitarFerramenta';
import MinhasFerramentas from './components/ferramentas/MinhasFerramentas';

export default function App() {
  const { current, booted, logoutMsg } = useAuth();
  const [view, setView] = useState('dash');

  useEffect(() => {
    if (current) setView(current.role === 'solic' ? 'nova' : 'dash');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current && current.user]);

  if (!booted) return null;
  if (!current) return <LoginScreen initialMsg={logoutMsg} />;

  const allowed = NAV[current.role].some(([id]) => id === view);
  const activeView = allowed ? view : NAV[current.role][0][0];

  return (
    <div className="app">
      <Sidebar view={activeView} setView={setView} />
      <main className="main" id="main">
        {activeView === 'dash' && <Dashboard setView={setView} />}
        {activeView === 'estoque' && <Estoque />}
        {activeView === 'movs' && <Movimentacoes />}
        {activeView === 'solic' && <Solicitacoes />}
        {activeView === 'ferramentas' && <Ferramentas />}
        {activeView === 'emprestimos' && <Emprestimos />}
        {activeView === 'repos' && <Reposicao />}
        {activeView === 'rel' && <Relatorios />}
        {activeView === 'nova' && <NovaSolicitacao onSent={() => setView('minhas')} />}
        {activeView === 'minhas' && <MinhasSolicitacoes onNew={() => setView('nova')} />}
        {activeView === 'nova-ferramenta' && <SolicitarFerramenta onSent={() => setView('minhas-ferramentas')} />}
        {activeView === 'minhas-ferramentas' && <MinhasFerramentas onNew={() => setView('nova-ferramenta')} />}
        {activeView === 'usuarios' && <Usuarios />}
        {activeView === 'config' && <Config />}
      </main>
    </div>
  );
}
