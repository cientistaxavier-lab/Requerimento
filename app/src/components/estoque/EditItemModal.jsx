import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { fmtN } from '../../lib/format';
import { CATS, UNITS } from '../../data/seed';

export default function EditItemModal({ itemId, onClose, onBack }) {
  const { data, editItem, helpers } = useData();
  const { show } = useToast();
  const it = itemId ? data.items.find((i) => i.id === itemId) : null;
  const open = !!(itemId && it);

  function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    const res = editItem(itemId, {
      code: f.code.value,
      name: f.name.value,
      cat: f.cat.value,
      unit: f.unit.value,
      loc: f.loc.value,
      min: f.min.value,
      max: f.max.value,
      cost: f.cost.value,
    });
    if (res.error) return show(res.error, 'err');
    show('Item ' + f.code.value.trim().toUpperCase() + ' atualizado.');
    onClose();
  }

  const locs = it ? [it.loc, ...helpers.freeSlots()] : [];
  const units = it && UNITS.indexOf(it.unit) === -1 ? [...UNITS, it.unit] : UNITS;

  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <>
          <div className="dh">
            <div>
              <h2>Editar item</h2>
              <span className="muted">O saldo muda por entrada, saída ou ajuste de saldo, para manter o histórico.</span>
            </div>
            <button className="x" type="button" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </div>
          <form className="dbody fgrid" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="ei-code">Código</label>
              <input id="ei-code" name="code" required defaultValue={it.code} />
            </div>
            <div className="field">
              <label htmlFor="ei-cat">Categoria</label>
              <select id="ei-cat" name="cat" defaultValue={it.cat}>
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="ei-name">Nome do item</label>
              <input id="ei-name" name="name" required defaultValue={it.name} />
            </div>
            <div className="field">
              <label htmlFor="ei-unit">Unidade</label>
              <select id="ei-unit" name="unit" defaultValue={it.unit}>
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ei-loc">Posição no mapa</label>
              <select id="ei-loc" name="loc" defaultValue={it.loc}>
                {locs.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ei-min">Estoque mínimo</label>
              <input id="ei-min" name="min" type="number" min="0" step="1" required defaultValue={it.min} />
            </div>
            <div className="field">
              <label htmlFor="ei-max">Estoque máximo</label>
              <input id="ei-max" name="max" type="number" min="1" step="1" required defaultValue={it.max} />
            </div>
            <div className="field">
              <label htmlFor="ei-cost">Custo unitário (R$)</label>
              <input id="ei-cost" name="cost" type="number" min="0" step="0.01" required defaultValue={it.cost} />
            </div>
            <div className="field">
              <label htmlFor="ei-qty">Saldo atual</label>
              <input id="ei-qty" value={fmtN(it.qty) + ' ' + it.unit} readOnly />
            </div>
            <div className="dfoot full">
              <button type="button" className="btn" onClick={() => onBack(itemId)}>
                Voltar
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
