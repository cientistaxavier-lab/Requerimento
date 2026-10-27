import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Head, Empty } from '../common/ui';
import Ticket from './Ticket';

export default function MinhasSolicitacoes({ onNew }) {
  const { current } = useAuth();
  const { data } = useData();
  const list = data.reqs.filter((r) => r.requester === current.name).sort((a, b) => b.ts - a.ts);

  return (
    <>
      <Head
        title="Minhas solicitações"
        sub="Acompanhe o andamento de cada pedido."
        actions={
          <button className="btn primary" type="button" onClick={onNew}>
            Nova solicitação
          </button>
        }
      />
      <section className="panel">
        {list.length ? list.map((r) => <Ticket key={r.id} req={r} mode="mine" onReject={() => {}} />) : <Empty>Você ainda não fez nenhuma solicitação.</Empty>}
      </section>
    </>
  );
}
