import { useState } from 'react';

export function useItemModals() {
  const [modal, setModal] = useState(null); // { mode, itemId, quickType }

  return {
    modal,
    openItem: (id) => setModal({ mode: 'detail', itemId: id }),
    openEdit: (id) => setModal({ mode: 'edit', itemId: id }),
    openQuick: (id, type) => setModal({ mode: 'quick', itemId: id, quickType: type }),
    askDelete: (id) => setModal({ mode: 'delete', itemId: id }),
    openNew: () => setModal({ mode: 'new' }),
    close: () => setModal(null),
  };
}
