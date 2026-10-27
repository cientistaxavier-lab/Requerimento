import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function DeleteToolModal({ toolId, onClose }) {
  const { current } = useAuth();
  const { data, deleteTool } = useData();
  const { show } = useToast();
  const t = toolId ? data.tools.find((x) => x.id === toolId) : null;
  const open = !!(toolId && t);
  if (!open) return <Modal open={false} onClose={onClose} />;

  function confirm() {
    const res = deleteTool(toolId, current.name);
    if (res.error) {
      show(res.error, 'err');
      return;
    }
    show('Ferramenta ' + t.patrimonio + ' excluída.');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="dh">
        <div>
          <h2>Excluir ferramenta?</h2>
          <span className="muted">Patrimônio {t.patrimonio}</span>
        </div>
        <button className="x" type="button" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>
      <div className="dbody">
        <p>
          A ferramenta <b>{t.name}</b> sai do catálogo. O histórico de empréstimos continua no relatório de auditoria.
        </p>
        <div className="dfoot">
          <button className="btn" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn danger" type="button" onClick={confirm}>
            Excluir ferramenta
          </button>
        </div>
      </div>
    </Modal>
  );
}
