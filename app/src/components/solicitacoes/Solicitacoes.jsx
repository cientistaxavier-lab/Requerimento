import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Head, Empty } from '../common/ui';
import Ticket from './Ticket';
import RejectModal from './RejectModal';

const TABS = [
  ['Pendente', 'Pendentes'],
  ['Aguardando gestor', 'Aguardando gestor'],
  ['Aprovada', 'Aprovadas'],
  ['Entregue', 'Entregues'],
  ['Recusada', 'Recusadas'],
  ['Todas', 'Todas'],
];

export default function Solicitacoes({ initialTab }) {
  const { data } = useData();
  const [tab, setTab] = useState(initialTab || 'Pendente');
  const [rejectId, setRejectId] = useState(null);

  const list = data.reqs.filter((r) => tab === 'Todas' || r.status === tab).slice().sort((a, b) => b.ts - a.ts);

  return (
    <>
      <Head
        title="Solicitações"
        sub={
          'Aprove, recuse e registre a entrega dos pedidos. Pedidos acima de ' +
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.limit) +
          ' passam também pelo gestor. A entrega baixa o estoque automaticamente.'
        }
      />
      <div className="tabs" role="group" aria-label="Filtrar por situação">
        {TABS.map(([id, label]) => {
          const n = id === 'Todas' ? data.reqs.length : data.reqs.filter((r) => r.status === id).length;
          return (
            <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>
              {label}
              <span className="ct">{n}</span>
            </button>
          );
        })}
      </div>
      <section className="panel">
        {list.length ? list.map((r) => <Ticket key={r.id} req={r} mode="admin" onReject={setRejectId} />) : <Empty>Nenhuma solicitação nesta situação.</Empty>}
      </section>
      <RejectModal reqId={rejectId} onClose={() => setRejectId(null)} />
    </>
  );
}
