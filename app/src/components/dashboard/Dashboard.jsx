import { useData } from '../../context/DataContext';
import { OPERATORS } from '../../data/seed';
import { startOfDay } from '../../lib/format';
import { brl } from '../../lib/format';
import { stOf, teamProd, topRequested } from '../../lib/domain';
import { Head, HBars } from '../common/ui';
import { useItemModals } from '../estoque/useItemModals';
import ItemModals from '../estoque/ItemModals';
import WarehouseMap from './WarehouseMap';
import AlertCenter from './AlertCenter';
import Chart14 from './Chart14';
import Ticket from '../solicitacoes/Ticket';
import RejectModal from '../solicitacoes/RejectModal';
import { useState } from 'react';

export default function Dashboard({ setView }) {
  const { data } = useData();
  const im = useItemModals();
  const [rejectId, setRejectId] = useState(null);

  const its = data.items;
  const today = startOfDay(Date.now());
  const low = its.filter((i) => stOf(i) !== 'ok');
  const outN = its.filter((i) => stOf(i) === 'out').length;
  const val = its.reduce((a, i) => a + i.qty * i.cost, 0);
  const pend = data.reqs.filter((r) => r.status === 'Pendente' || r.status === 'Aguardando gestor').sort((a, b) => a.ts - b.ts);
  const urg = pend.filter((r) => r.urgency === 'Urgente').length;
  const ag = pend.filter((r) => r.status === 'Aguardando gestor').length;
  const tm = data.movs.filter((m) => m.ts >= today);
  const ent = tm.filter((m) => m.type === 'entrada').length;
  const sai = tm.filter((m) => m.type === 'saida').length;
  const need = [...low].sort((a, b) => a.qty / a.min - b.qty / b.min).slice(0, 6);
  const tp = teamProd(data, OPERATORS, 7);

  return (
    <>
      <Head
        title="Painel"
        sub="Situação do almoxarifado agora: saldos, pendências e ritmo da operação."
        actions={
          <>
            <button className="btn" type="button" onClick={() => setView('movs')}>
              Registrar movimentação
            </button>
            <button className="btn primary" type="button" onClick={() => setView('solic')}>
              Ver solicitações
            </button>
          </>
        }
      />
      <section className="kpis" aria-label="Indicadores">
        <div className="kpi">
          <div className="v">{its.length}</div>
          <div className="l">Itens cadastrados</div>
          <div className="s">Estoque valorizado em {brl(val)}</div>
        </div>
        <div className="kpi warn">
          <div className="v">{low.length}</div>
          <div className="l">Precisam de reposição</div>
          <div className="s">{outN} em ruptura</div>
        </div>
        <div className="kpi info">
          <div className="v">{pend.length}</div>
          <div className="l">Solicitações pendentes</div>
          <div className="s">
            {urg} urgentes, {ag} com o gestor
          </div>
        </div>
        <div className="kpi">
          <div className="v">{tm.length}</div>
          <div className="l">Movimentações hoje</div>
          <div className="s">
            {ent} entradas e {sai} saídas
          </div>
        </div>
      </section>

      <AlertCenter onOpenItem={im.openItem} />

      <section className="panel">
        <header>
          <h2>Mapa do almoxarifado</h2>
          <div className="legend">
            <span>
              <i style={{ background: 'var(--ok)' }} />
              Normal
            </span>
            <span>
              <i style={{ background: 'var(--amber)' }} />
              Abaixo do mínimo
            </span>
            <span>
              <i style={{ background: 'repeating-linear-gradient(45deg,var(--bad) 0 3px,transparent 3px 6px)' }} />
              Ruptura
            </span>
            <span>
              <i style={{ border: '1px dashed var(--ink2)' }} />
              Posição livre
            </span>
          </div>
        </header>
        <div className="body">
          <WarehouseMap onOpenItem={im.openItem} />
          <p className="hint" style={{ marginTop: 14 }}>
            A barra inferior de cada posição mostra o saldo em relação ao máximo. Clique para ver detalhes, editar ou excluir. Segure e arraste um item para uma posição livre, ou solte sobre outro item para trocar os dois de lugar.
          </p>
        </div>
      </section>

      <div className="grid2">
        <section className="panel">
          <header>
            <h2>Aguardando decisão</h2>
            <button className="link" type="button" onClick={() => setView('solic')}>
              Ver todas
            </button>
          </header>
          {pend.length ? pend.slice(0, 3).map((r) => <Ticket key={r.id} req={r} mode="admin" onReject={setRejectId} />) : <div className="empty">Nenhuma solicitação aguardando decisão.</div>}
        </section>
        <section className="panel">
          <header>
            <h2>Reposição mais urgente</h2>
            <button className="link" type="button" onClick={() => setView('repos')}>
              Abrir reposição
            </button>
          </header>
          <div className="body">
            {need.length ? (
              need.map((i) => {
                const pct = Math.min(100, Math.round((i.qty / i.min) * 100));
                return (
                  <div className="hb" style={{ gridTemplateColumns: 'minmax(0,1fr) 110px auto' }} key={i.id}>
                    <span className="hl">
                      <button className="link" type="button" onClick={() => im.openItem(i.id)} style={{ textDecoration: 'none', color: 'inherit', textAlign: 'left' }}>
                        {i.name}
                      </button>
                    </span>
                    <span className="track">
                      <i style={{ width: pct + '%', background: 'var(--' + (stOf(i) === 'out' ? 'bad' : 'amber') + ')' }} />
                    </span>
                    <span className="hv">
                      {i.qty} de {i.min}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="muted">Todos os itens estão acima do mínimo.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid3">
        <section className="panel">
          <header>
            <h2>Entradas e saídas, 14 dias</h2>
          </header>
          <div className="body">
            <Chart14 />
          </div>
        </section>
        <section className="panel">
          <header>
            <h2>Mais requisitados, 30 dias</h2>
          </header>
          <div className="body">
            <HBars data={topRequested(data, 30, 7)} fmt={(d) => d.value + ' saídas'} />
          </div>
        </section>
        <section className="panel">
          <header>
            <h2>Produtividade, 7 dias</h2>
          </header>
          <div className="body">
            <HBars data={tp} fmt={(d) => d.value + ' mov.'} />
            <p className="hint">Movimentações registradas por operador.</p>
          </div>
        </section>
      </div>

      <ItemModals {...im} />
      <RejectModal reqId={rejectId} onClose={() => setRejectId(null)} />
    </>
  );
}
