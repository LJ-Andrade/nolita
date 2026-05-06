import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

export function BulkActionsBar({ 
  selectedCount, 
  onDelete, 
  onClear,
  deleteLabel,
  confirmMessage,
  isDeleting = false
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (selectedCount === 0) return null;

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background border border-border shadow-lg rounded-lg px-4 py-3 animate-in slide-in-from-bottom-4">
        <span className="text-sm font-medium">
          {`${selectedCount} seleccionado(s)`}
        </span>
        <div className="h-4 w-px bg-border" />
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleteLabel || "Eliminar seleccionados"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isDeleting}
        >
          <X className="h-4 w-4 mr-2" />
          {"Limpiar"}
        </Button>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={"Confirmar eliminación"}
        description={confirmMessage || `¿Estás seguro de eliminar ${selectedCount} elementos?`}
        confirmText={"Confirmar"}
        cancelText={"Cancelar"}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
