import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { TOOL_CATS } from '../../data/seed';

export default function NewToolModal({ open, onClose }) {
  const { addTool } = useData();
  const { show } = useToast();

  function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    const res = addTool({ patrimonio: f.patrimonio.value, name: f.name.value, cat: f.cat.value, cost: f.cost.value });
    if (res.error) return show(res.error, 'err');
    show('Ferramenta ' + f.patrimonio.value.trim().toUpperCase() + ' cadastrada.');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <>
          <div className="dh">
            <div>
              <h2>Nova ferramenta</h2>
              <span className="muted">Cada ferramenta tem um patrimônio único — não tem saldo, é emprestada por vez.</span>
            </div>
            <button className="x" type="button" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </div>
          <form className="dbody fgrid" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="nt-pat">Patrimônio</label>
              <input id="nt-pat" name="patrimonio" required placeholder="Ex.: PAT-0501" />
            </div>
            <div className="field">
              <label htmlFor="nt-cat">Categoria</label>
              <select id="nt-cat" name="cat">
                {TOOL_CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="nt-name">Nome da ferramenta</label>
              <input id="nt-name" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="nt-cost">Custo de reposição (R$)</label>
              <input id="nt-cost" name="cost" type="number" min="0" step="0.01" required />
            </div>
            <div className="dfoot full">
              <button type="button" className="btn" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn primary" type="submit">
                Cadastrar ferramenta
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
