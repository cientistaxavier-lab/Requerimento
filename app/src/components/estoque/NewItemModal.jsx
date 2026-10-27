import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { CATS, UNITS } from '../../data/seed';

export default function NewItemModal({ open, onClose }) {
  const { current } = useAuth();
  const { helpers, addItem } = useData();
  const { show } = useToast();
  const locs = open ? helpers.freeSlots() : [];

  function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    const res = addItem(
      { code: f.code.value, name: f.name.value, cat: f.cat.value, unit: f.unit.value, loc: f.loc.value, min: f.min.value, max: f.max.value, qty: f.qty.value, cost: f.cost.value },
      current.name
    );
    if (res.error) return show(res.error, 'err');
    show('Item ' + f.code.value.trim().toUpperCase() + ' cadastrado.');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <>
          <div className="dh">
            <div>
              <h2>Novo item</h2>
              <span className="muted">Cadastre o item e escolha a posição no mapa.</span>
            </div>
            <button className="x" type="button" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </div>
          <form className="dbody fgrid" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="ni-code">Código</label>
              <input id="ni-code" name="code" required placeholder="Ex.: EPI-007" />
            </div>
            <div className="field">
              <label htmlFor="ni-cat">Categoria</label>
              <select id="ni-cat" name="cat">
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field full">
              <label htmlFor="ni-name">Nome do item</label>
              <input id="ni-name" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="ni-unit">Unidade</label>
              <select id="ni-unit" name="unit">
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ni-loc">Posição</label>
              <select id="ni-loc" name="loc">
                {locs.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ni-min">Estoque mínimo</label>
              <input id="ni-min" name="min" type="number" min="0" step="1" required />
            </div>
            <div className="field">
              <label htmlFor="ni-max">Estoque máximo</label>
              <input id="ni-max" name="max" type="number" min="1" step="1" required />
            </div>
            <div className="field">
              <label htmlFor="ni-qty">Saldo inicial</label>
              <input id="ni-qty" name="qty" type="number" min="0" step="1" defaultValue={0} required />
            </div>
            <div className="field">
              <label htmlFor="ni-cost">Custo unitário (R$)</label>
              <input id="ni-cost" name="cost" type="number" min="0" step="0.01" required />
            </div>
            <div className="dfoot full">
              <button type="button" className="btn" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn primary" type="submit">
                Cadastrar item
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
