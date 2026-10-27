import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Head, Empty } from '../common/ui';
import { loanDisplayStatus } from '../../lib/domain';
import LoanTicket from './LoanTicket';
import RejectLoanModal from './RejectLoanModal';

const TABS = [
  ['Pendente', 'Pendentes'],
  ['Aprovada', 'Aprovadas'],
  ['Emprestada', 'Emprestadas'],
  ['Atrasada', 'Atrasadas'],
  ['Devolvida', 'Devolvidas'],
  ['Recusada', 'Recusadas'],
  ['Todas', 'Todas'],
];

export default function Emprestimos() {
  const { data } = useData();
  const [tab, setTab] = useState('Pendente');
  const [rejectId, setRejectId] = useState(null);

  const withStatus = data.toolLoans.map((l) => ({ l, s: loanDisplayStatus(l) }));
  const list = withStatus.filter(({ s }) => tab === 'Todas' || s === tab).sort((a, b) => b.l.ts - a.l.ts);

  return (
    <>
      <Head title="Empréstimos" sub="Ferramentas emprestadas aos colaboradores, com prazo de devolução. Quem não devolve no prazo fica bloqueado para novos pedidos." />
      <div className="tabs" role="group" aria-label="Filtrar por situação">
        {TABS.map(([id, label]) => {
          const n = id === 'Todas' ? withStatus.length : withStatus.filter((x) => x.s === id).length;
          return (
            <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>
              {label}
              <span className="ct">{n}</span>
            </button>
          );
        })}
      </div>
      <section className="panel">
        {list.length ? list.map(({ l }) => <LoanTicket key={l.id} loan={l} onReject={setRejectId} />) : <Empty>Nenhum empréstimo nesta situação.</Empty>}
      </section>
      <RejectLoanModal loanId={rejectId} onClose={() => setRejectId(null)} />
    </>
  );
}
