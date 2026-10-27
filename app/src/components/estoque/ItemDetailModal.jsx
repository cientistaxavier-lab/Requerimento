import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Pill } from '../common/ui';
import { fmtN, brl, fDT } from '../../lib/format';
import { stOf, outByItem, coverage, fmtCov } from '../../lib/domain';

export default function ItemDetailModal({ itemId, onClose, onEdit, onQuick, onDelete }) {
  const { current, isGestor } = useAuth();
  const { data } = useData();
  if (!itemId) return <Modal open={false} onClose={onClose} />;
  const it = data.items.find((i) => i.id === itemId);
  if (!it) return <Modal open={false} onClose={onClose} />;

  const s = stOf(it);
  const out = outByItem(data, 30);
  const avg = (out[it.id] || 0) / 30;
  const cov = coverage(it, out);
  const hist = data.movs.filter((m) => m.itemId === itemId).slice(-8).reverse();
  const labels = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' };

  return (
    <Modal open={!!itemId} onClose={onClose}>
      <div className="dh">
        <div>
          <h2>{it.name}</h2>
          <span className="muted">Código {it.code}</span> <Pill status={s} />
        </div>
        <button className="x" type="button" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>
      <div className="dbody">
        <dl className="facts">
          <div>
            <dt>Saldo</dt>
            <dd>
              {fmtN(it.qty)} {it.unit}
            </dd>
          </div>
          <div>
            <dt>Mínimo e máximo</dt>
            <dd>
              {it.min} e {it.max}
            </dd>
          </div>
          <div>
            <dt>Posição</dt>
            <dd>{it.loc}</dd>
          </div>
          <div>
            <dt>Categoria</dt>
            <dd>{it.cat}</dd>
          </div>
          <div>
            <dt>Custo unitário</dt>
            <dd>{brl(it.cost)}</dd>
          </div>
          <div>
            <dt>Valor em estoque</dt>
            <dd>{brl(it.qty * it.cost)}</dd>
          </div>
          <div>
            <dt>Consumo por dia</dt>
            <dd>
              {fmtN(Math.round(avg * 10) / 10)} {it.unit}
            </dd>
          </div>
          <div>
            <dt>Cobertura</dt>
            <dd style={{ fontSize: 17 }}>{fmtCov(cov)}</dd>
          </div>
        </dl>
        <h3 style={{ fontSize: 19, marginBottom: 6 }}>Últimas movimentações</h3>
        {hist.length ? (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th className="n">Qtd.</th>
                  <th>Responsável</th>
                </tr>
              </thead>
              <tbody>
                {hist.map((m) => (
                  <tr key={m.id}>
                    <td>{fDT(m.ts)}</td>
                    <td>{labels[m.type]}</td>
                    <td className="n">
                      {m.delta > 0 ? '+' : ''}
                      {m.delta}
                    </td>
                    <td>{m.who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Sem movimentações registradas.</p>
        )}
        <div className="dfoot">
          {isGestor && (
            <button className="btn danger" type="button" onClick={() => onDelete(it.id)} style={{ marginRight: 'auto' }}>
              Excluir
            </button>
          )}
          {isGestor && (
            <button className="btn" type="button" onClick={() => onEdit(it.id)}>
              Editar
            </button>
          )}
          {current.role !== 'solic' && (
            <>
              <button className="btn" type="button" onClick={() => onQuick(it.id, 'ajuste')}>
                Ajustar saldo
              </button>
              <button className="btn" type="button" onClick={() => onQuick(it.id, 'entrada')}>
                Entrada
              </button>
              <button className="btn" type="button" onClick={() => onQuick(it.id, 'saida')}>
                Saída
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
