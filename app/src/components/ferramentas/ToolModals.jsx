import NewToolModal from './NewToolModal';
import EditToolModal from './EditToolModal';
import DeleteToolModal from './DeleteToolModal';
import ToolHistoryModal from './ToolHistoryModal';

export default function ToolModals({ toolModal, closeTool }) {
  const toolId = toolModal ? toolModal.toolId : null;
  return (
    <>
      <NewToolModal open={toolModal?.mode === 'new'} onClose={closeTool} />
      <EditToolModal toolId={toolModal?.mode === 'edit' ? toolId : null} onClose={closeTool} />
      <DeleteToolModal toolId={toolModal?.mode === 'delete' ? toolId : null} onClose={closeTool} />
      <ToolHistoryModal toolId={toolModal?.mode === 'history' ? toolId : null} onClose={closeTool} />
    </>
  );
}
