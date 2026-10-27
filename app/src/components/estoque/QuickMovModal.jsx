import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast, crossedMessage } from '../../context/ToastContext';
import { fmtN } from '../../lib/format';
import { SECTORS } from '../../data/seed';

export default function QuickMovModal({ itemId, type, onClose, onBack }) {
  const { current } = useAuth();
  const { data, addMov } = useData();
  const { show } = useToast();
  const it = itemId ? data.items.find((i) => i.id === itemId) : null;
  const open = !!(itemId && type && it);
  const isIn = type === 'entrada';
  const isAj = type === 'ajuste';

  function onSubmit(e) {
    e.preventDefault();
    const f = e.target.elements;
    const q = parseInt(f.qty.value, 10);
    let delta;
    if (isAj) {
      if (isNaN(q) || q < 0) return show('Informe a contagem física.', 'err');
      delta = q - it.qty;
      if (delta === 0) return show('A contagem é igual ao saldo. Nenhum ajuste necessário.', 'err');
    } else {
      if (!(q > 0)) return show('Informe uma quantidade maior que zero.', 'err');
      delta = isIn ? q : -q;
    }
    const res = addMov({
      type,
      itemId,
      delta,
      who: current.name,
      ref: f.ref ? f.ref.value : '',
      sector: f.sector ? f.sector.value : '',
      note: f.note.value,
    });
    if (res.error) return show(res.error, 'err');
    const base = isAj ? 'Ajuste registrado.' : isIn ? 'Entrada registrada.' : 'Saída registrada.';
    const { msg, kind } = crossedMessage(base, res.crossed ? [res.crossed] : null);
    show(msg, kind);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <>
          <div className="dh">
            <div>
              <h2>
                {isAj ? 'Ajustar saldo de ' : isIn ? 'Entrada de ' : 'Saída de '}
                {it.name}
              </h2>
              <span className="muted">
                Saldo atual: {fmtN(it.qty)} {it.unit}
              </span>
            </div>
            <button className="x" type="button" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </div>
          <form className="dbody fgrid" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="q-qty">{isAj ? 'Contagem física' : 'Quantidade'}</label>
              <input id="q-qty" name="qty" type="number" min={isAj ? 0 : 1} step="1" required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="q-who">Responsável</label>
              <input id="q-who" value={current.name} readOnly />
            </div>
            {!isAj &&
              (isIn ? (
                <div className="field full">
                  <label htmlFor="q-ref">Documento (nota fiscal ou pedido)</label>
                  <input id="q-ref" name="ref" type="text" />
                </div>
              ) : (
                <div className="field full">
                  <label htmlFor="q-sec">Setor de destino</label>
                  <select id="q-sec" name="sector" defaultValue={SECTORS[0]}>
                    {SECTORS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            <div className="field full">
              <label htmlFor="q-note">{isAj ? 'Motivo do ajuste' : 'Observação'}</label>
              <textarea id="q-note" name="note" placeholder="Opcional" />
            </div>
            <div className="dfoot full">
              <button type="button" className="btn" onClick={() => onBack(itemId)}>
                Voltar
              </button>
              <button className="btn primary" type="submit">
                Registrar {isAj ? 'ajuste' : isIn ? 'entrada' : 'saída'}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
