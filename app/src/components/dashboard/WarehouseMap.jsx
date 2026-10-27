import { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { stOf } from '../../lib/domain';
import { useWarehouseDrag } from '../../hooks/useWarehouseDrag';
import { useToast } from '../../context/ToastContext';

const CORRIDORS = [
  ['A', 'EPI'],
  ['B', 'Embalagem'],
  ['C', 'Escritório e limpeza'],
  ['D', 'Manutenção e TI'],
];

export default function WarehouseMap({ onOpenItem }) {
  const { isGestor } = useAuth();
  const { data, moveItem, undoMove } = useData();
  const { show } = useToast();
  const rackRef = useRef(null);
  const noClickUntil = useRef(0);

  const suppressClick = () => {
    noClickUntil.current = Date.now() + 350;
  };

  const handleDrop = (id, loc) => {
    const it = data.items.find((i) => i.id === id);
    if (!it) return;
    const target = data.items.find((i) => i.loc === loc);
    const move = moveItem(id, loc);
    if (!move) return;
    const undo = () => {
      const ok = undoMove(move);
      show(ok ? 'Movimentação desfeita.' : 'Não foi possível desfazer: as posições mudaram.', ok ? undefined : 'err');
    };
    if (target && target.id !== id) show(it.name + ' trocou de lugar com ' + target.name + '.', undefined, undo);
    else show(it.name + ' movido de ' + move.from + ' para ' + loc + '.', undefined, undo);
  };

  const { onPointerDown, onKeyDownEscape } = useWarehouseDrag(rackRef, isGestor, handleDrop);

  const byLoc = {};
  data.items.forEach((i) => (byLoc[i.loc] = i));

  return (
    <div className={'racks' + (isGestor ? ' movable' : '')} id="rack" ref={rackRef} onKeyDown={(e) => e.key === 'Escape' && onKeyDownEscape()}>
      {CORRIDORS.map(([code, name]) => (
        <div className="rack" key={code}>
          <div className="rackhead">
            <h3>Corredor {code}</h3>
            <span className="muted">{name}</span>
          </div>
          <div className="bays">
            {[3, 2, 1].flatMap((lv) =>
              [1, 2, 3, 4, 5, 6].map((b) => {
                const loc = code + b + '-' + lv;
                const it = byLoc[loc];
                if (!it) return <div className="slot s-free" data-loc={loc} key={loc} aria-hidden="true" />;
                const s = stOf(it);
                const pct = Math.max(0, Math.min(100, Math.round((it.qty / it.max) * 100)));
                const tip = it.name + ': ' + it.qty + ' ' + it.unit + ' (mínimo ' + it.min + '), posição ' + loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    className={'slot s-' + s}
                    data-id={it.id}
                    data-loc={loc}
                    title={tip}
                    aria-label={tip}
                    onPointerDown={(e) => onPointerDown(e, it.id, suppressClick)}
                    onClick={() => {
                      if (Date.now() < noClickUntil.current) return;
                      onOpenItem(it.id);
                    }}
                  >
                    <span className="sc">{it.code}</span>
                    <span className="fill" style={{ width: pct + '%' }} />
                  </button>
                );
              })
            )}
          </div>
          <div className="baynums" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
