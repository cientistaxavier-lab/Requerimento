import ItemDetailModal from './ItemDetailModal';
import EditItemModal from './EditItemModal';
import QuickMovModal from './QuickMovModal';
import DeleteItemModal from './DeleteItemModal';

export default function ItemModals({ modal, openItem, openEdit, openQuick, askDelete, close }) {
  const itemId = modal ? modal.itemId : null;
  return (
    <>
      <ItemDetailModal itemId={modal?.mode === 'detail' ? itemId : null} onClose={close} onEdit={openEdit} onQuick={openQuick} onDelete={askDelete} />
      <EditItemModal itemId={modal?.mode === 'edit' ? itemId : null} onClose={close} onBack={openItem} />
      <QuickMovModal itemId={modal?.mode === 'quick' ? itemId : null} type={modal?.mode === 'quick' ? modal.quickType : null} onClose={close} onBack={openItem} />
      <DeleteItemModal itemId={modal?.mode === 'delete' ? itemId : null} onClose={close} onBack={openItem} />
    </>
  );
}
