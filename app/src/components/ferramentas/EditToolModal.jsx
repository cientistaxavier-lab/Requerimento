import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { TOOL_CATS } from '../../data/seed';

export default function EditToolModal({ toolId, onClose }) {
  const { data, editTool } = useData();
  const t = toolId ? data.tools.find((x) => x.id === toolId) : null;
  const open = !!(toolId && t);
  const { show } = useToast();

  function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    const res = editTool(toolId, { patrimonio: f.patrimonio.value, name: f.name.value, cat: f.cat.value, cost: f.cost.value });
    if (res.error) return show(res.error, 'err');
    show('Ferramenta ' + f.patrimonio.value.trim().toUpperCase() + ' atualizada.');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <>
          <div className="dh">
            <div>
              <h2>Editar ferramenta</h2>
            </div>
            <button className="x" type="button" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </div>
          <form className="dbody fgrid" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="et-pat">Patrimônio</label>
              <input id="et-pat" name="patrimonio" required defaultValue={t.patrimonio} />
            </div>
            <div className="field">
              <label htmlFor="et-cat">Categoria</label>
              <select id="et-cat" name="cat" defaultValue={t.cat}>
                {TOOL_CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="et-name">Nome da ferramenta</label>
              <input id="et-name" name="name" required defaultValue={t.name} />
            </div>
            <div className="field">
              <label htmlFor="et-cost">Custo de reposição (R$)</label>
              <input id="et-cost" name="cost" type="number" min="0" step="0.01" required defaultValue={t.cost} />
            </div>
            <div className="dfoot full">
              <button type="button" className="btn" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn primary" type="submit">
                Salvar alterações
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
