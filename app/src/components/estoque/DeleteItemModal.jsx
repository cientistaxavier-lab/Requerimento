import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { fmtN, brl } from '../../lib/format';

export default function DeleteItemModal({ itemId, onClose, onBack }) {
  const { current } = useAuth();
  const { data, deleteItem } = useData();
  const { show } = useToast();
  const it = itemId ? data.items.find((i) => i.id === itemId) : null;
  const open = !!(itemId && it);
  if (!open) return <Modal open={false} onClose={onClose} />;

  const busy = data.reqs.filter(
    (r) => (r.status === 'Pendente' || r.status === 'Aguardando gestor' || r.status === 'Aprovada') && r.items.some((l) => l.id === itemId)
  );

  function confirm() {
    const res = deleteItem(itemId, current.name);
    if (res.error) {
      show(res.error, 'err');
      return;
    }
    show('Item ' + it.code + ' excluído.');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="dh">
        <div>
          <h2>Excluir item?</h2>
          <span className="muted">Código {it.code}</span>
        </div>
        <button className="x" type="button" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>
      <div className="dbody">
        {busy.length ? (
          <>
            <p>
              Não dá para excluir <b>{it.name}</b> agora: ele está em solicitações em andamento ({busy.map((r) => r.id).join(', ')}). Conclua ou recuse esses pedidos primeiro.
            </p>
            <div className="dfoot">
              <button className="btn primary" type="button" onClick={() => onBack(itemId)}>
                Voltar
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              O item <b>{it.name}</b> sai do estoque, do mapa e da lista de reposição.
              {it.qty > 0
                ? ' Ainda há ' + fmtN(it.qty) + ' ' + it.unit + ' em estoque (' + brl(it.qty * it.cost) + '). Se esse saldo precisa constar nos relatórios, dê a baixa antes.'
                : ''}{' '}
              O histórico de movimentações e de solicitações continua nos relatórios.
            </p>
            <div className="dfoot">
              <button className="btn" type="button" onClick={() => onBack(itemId)}>
                Cancelar
              </button>
              <button className="btn danger" type="button" onClick={confirm}>
                Excluir item
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
