import { useCallback, useRef } from 'react';

// Arrastar-e-soltar do mapa do almoxarifado. `enabled` controla se o gesto é permitido
// (só o gestor reorganiza o mapa). `onDrop(id, loc)` é chamado ao soltar sobre uma posição válida.
export function useWarehouseDrag(containerRef, enabled, onDrop) {
  const dr = useRef(null);

  const clearDropClasses = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    root.querySelectorAll('.drop-ok,.drop-swap').forEach((el) => el.classList.remove('drop-ok', 'drop-swap'));
  }, [containerRef]);

  const slotAt = useCallback(
    (x, y) => {
      const el = document.elementFromPoint(x, y);
      const root = containerRef.current;
      if (!el || !root) return null;
      const slot = el.closest('.slot[data-loc]');
      return slot && root.contains(slot) ? slot : null;
    },
    [containerRef]
  );

  const updateOver = useCallback(() => {
    const d = dr.current;
    if (!d) return;
    const s = slotAt(d.lx, d.ly);
    clearDropClasses();
    d.over = null;
    if (s && s !== d.el) {
      d.over = s;
      s.classList.add(s.getAttribute('data-id') ? 'drop-swap' : 'drop-ok');
    }
  }, [slotAt, clearDropClasses]);

  const startDrag = useCallback(() => {
    const d = dr.current;
    if (!d || d.active) return;
    d.active = true;
    clearTimeout(d.timer);
    const r = d.el.getBoundingClientRect();
    const g = d.el.cloneNode(true);
    g.removeAttribute('data-id');
    g.removeAttribute('data-loc');
    g.removeAttribute('title');
    g.classList.add('ghost');
    g.style.width = r.width + 'px';
    g.style.height = r.height + 'px';
    d.ox = d.sx - r.left;
    d.oy = d.sy - r.top;
    g.style.left = d.lx - d.ox + 'px';
    g.style.top = d.ly - d.oy + 'px';
    document.body.appendChild(g);
    d.ghost = g;
    d.el.classList.add('dragging');
    document.body.classList.add('is-dragging');
    d.scrollT = setInterval(() => {
      if (d.ly < 70) window.scrollBy(0, -12);
      else if (d.ly > window.innerHeight - 70) window.scrollBy(0, 12);
      else return;
      updateOver();
    }, 16);
    updateOver();
  }, [updateOver]);

  const endDrag = useCallback(
    (commit) => {
      const d = dr.current;
      dr.current = null;
      if (!d) return;
      clearTimeout(d.timer);
      clearInterval(d.scrollT);
      document.removeEventListener('pointermove', d.onMove);
      document.removeEventListener('pointerup', d.onUp);
      document.removeEventListener('pointercancel', d.onCancel);
      window.removeEventListener('blur', d.onCancel);
      if (!d.active) return;
      if (d.ghost && d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
      d.el.classList.remove('dragging');
      clearDropClasses();
      document.body.classList.remove('is-dragging');
      d.suppressClick();
      if (commit && d.over) onDrop(d.id, d.over.getAttribute('data-loc'));
    },
    [clearDropClasses, onDrop]
  );

  const onPointerDown = useCallback(
    (e, id, suppressClick) => {
      if (!enabled || dr.current) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const el = e.currentTarget;
      const d = {
        id,
        el,
        sx: e.clientX,
        sy: e.clientY,
        lx: e.clientX,
        ly: e.clientY,
        type: e.pointerType,
        active: false,
        over: null,
        ghost: null,
        timer: null,
        scrollT: null,
        suppressClick,
      };
      dr.current = d;

      d.onMove = (ev) => {
        d.lx = ev.clientX;
        d.ly = ev.clientY;
        if (!d.active) {
          const dist = Math.hypot(d.lx - d.sx, d.ly - d.sy);
          if (d.type === 'mouse') {
            if (dist > 5) startDrag();
          } else if (dist > 10) {
            endDrag(false);
          }
          if (!dr.current || !dr.current.active) return;
        }
        d.ghost.style.left = d.lx - d.ox + 'px';
        d.ghost.style.top = d.ly - d.oy + 'px';
        updateOver();
      };
      d.onUp = (ev) => {
        if (d.active) {
          d.lx = ev.clientX;
          d.ly = ev.clientY;
          updateOver();
          endDrag(true);
        } else endDrag(false);
      };
      d.onCancel = () => endDrag(false);

      document.addEventListener('pointermove', d.onMove);
      document.addEventListener('pointerup', d.onUp);
      document.addEventListener('pointercancel', d.onCancel);
      window.addEventListener('blur', d.onCancel);
      if (e.pointerType !== 'mouse') d.timer = setTimeout(startDrag, 320);
    },
    [enabled, startDrag, endDrag, updateOver]
  );

  const onKeyDownEscape = useCallback(() => {
    if (dr.current && dr.current.active) endDrag(false);
  }, [endDrag]);

  return { onPointerDown, onKeyDownEscape };
}
