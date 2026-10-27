import { useState } from 'react';

export function useToolModals() {
  const [modal, setModal] = useState(null); // { mode, toolId }

  return {
    toolModal: modal,
    openNewTool: () => setModal({ mode: 'new' }),
    openEditTool: (id) => setModal({ mode: 'edit', toolId: id }),
    askDeleteTool: (id) => setModal({ mode: 'delete', toolId: id }),
    openToolHistory: (id) => setModal({ mode: 'history', toolId: id }),
    closeTool: () => setModal(null),
  };
}
