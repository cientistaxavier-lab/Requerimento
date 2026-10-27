import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { fDT } from '../../lib/format';
import { loanDisplayStatus } from '../../lib/domain';

export default function ToolHistoryModal({ toolId, onClose }) {
  const { data } = useData();
  const t = toolId ? data.tools.find((x) => x.id === toolId) : null;
  const open = !!(toolId && t);
  if (!open) return <Modal open={false} onClose={onClose} />;

  const hist = data.toolLoans.filter((l) => l.toolId === toolId).sort((a, b) => b.ts - a.ts);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="dh">
        <div>
          <h2>Histórico de {t.name}</h2>
          <span className="muted">Patrimônio {t.patrimonio}</span>
        </div>
        <button className="x" type="button" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>
      <div className="dbody">
        {hist.length ? (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Empréstimo</th>
                  <th>Solicitante</th>
                  <th>Retirada</th>
                  <th>Prazo</th>
                  <th>Devolução</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {hist.map((l) => {
                  const s = loanDisplayStatus(l);
                  return (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td>{l.requester}</td>
                      <td>{l.deliveredAt ? fDT(l.deliveredAt) : '-'}</td>
                      <td>{l.dueAt ? fDT(l.dueAt) : '-'}</td>
                      <td>{l.returnedAt ? fDT(l.returnedAt) : '-'}</td>
                      <td>
                        <span className={'pill p-' + s}>{s}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Nenhum empréstimo registrado para esta ferramenta.</p>
        )}
        <div className="dfoot">
          <button className="btn primary" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
