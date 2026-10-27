import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { msg, kind, onUndo }
  const timer = useRef(null);

  const show = useCallback((msg, kind, onUndo) => {
    clearTimeout(timer.current);
    setToast({ msg, kind, onUndo });
    timer.current = setTimeout(() => setToast(null), onUndo ? 8000 : kind === 'warn' ? 6500 : 3800);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, show, hide }}>
      {children}
      {toast && (
        <div className={'toast' + (toast.kind === 'err' ? ' err' : toast.kind === 'warn' ? ' warn' : '')} role="status">
          {toast.msg}
          {toast.onUndo && (
            <button
              type="button"
              className="tbtn"
              onClick={() => {
                toast.onUndo();
              }}
            >
              Desfazer
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}

// Facilita notificar quando uma movimentação cruza o mínimo do item.
export function crossedMessage(base, crossedList) {
  if (!crossedList || !crossedList.length) return { msg: base, kind: undefined };
  const n = crossedList.map((i) => i.name + ' (' + i.qty + ' de ' + i.min + ')').join(', ');
  return { msg: base + ' Alerta: abaixo do mínimo, ' + n + '.', kind: 'warn' };
}
