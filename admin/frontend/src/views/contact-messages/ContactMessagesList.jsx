import { useState, useEffect } from 'react';
import axiosClient from '@/lib/axios';
import { 
  Search, 
  Trash2, 
  Mail,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useBulkSelect } from '@/hooks/use-bulk-select';
export default function ContactMessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [meta, setMeta] = useState(null);

  const { 
    selectedIds, 
    selectedCount,
    isAllSelected, 
    toggleSelect, 
    toggleSelectAll, 
    clearSelection,
    isSelected
  } = useBulkSelect(messages);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchMessages();
  }, [page, debouncedSearch]);

  useEffect(() => {
    clearSelection();
  }, [page, debouncedSearch]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('contact-messages', {
        params: { 
          page, 
          search: debouncedSearch,
          perPage: 10
        }
      });
      setMessages(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setDetailDialogOpen(true);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosClient.patch(`contact-messages/${id}/mark-read`);
      setMessages(prev => prev.map(m => 
        m.id === id ? { ...m, is_read: true } : m
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    try {
      await axiosClient.delete(`contact-messages/${messageToDelete.id}`);
      toast.success('Mensaje eliminado correctamente');
      fetchMessages();
    } catch (error) {
      toast.error('Error al eliminar mensaje');
    } finally {
      setIsDeleting(false);
      setMessageToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosClient.post("contact-messages/bulk-delete");
      toast.success(`${selectedIds.length} mensajes eliminados`);
      clearSelection();
      fetchMessages();
    } catch (error) {
      toast.error('Error en eliminación masiva');
    } finally {
      setIsDeleting(false);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Mensajes de Contacto</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los mensajes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right w-[150px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
              {loading && messages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Cargando...</TableCell>
                </TableRow>
              )}
              {!loading && messages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron mensajes.
                  </TableCell>
                </TableRow>
              )}
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <Checkbox checked={isSelected(message.id)} onCheckedChange={() => toggleSelect(message.id)} />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {message.id}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{message.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" /> {message.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm">
                      {message.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(message.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {message.is_read ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                        <Check className="h-3 w-3" /> Leído
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <X className="h-3 w-3" /> No leído
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewMessage(message)}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Ver mensaje
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(message)} className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="hidden lg:flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewMessage(message)}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteClick(message)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selectedCount > 0 && (
            <div className="flex items-center justify-between py-4 border-t">
              <span className="text-sm text-muted-foreground">{selectedCount} seleccionados</span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar seleccionados
              </Button>
            </div>
          )}

          <ConfirmationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="¿Eliminar mensaje?"
            description={`Esta acción no se puede deshacer. Se eliminará el mensaje de "${messageToDelete?.name}".`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            onConfirm={handleConfirmDelete}
            loading={isDeleting}
          />

          <ConfirmationDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            title={`Mensaje de ${selectedMessage?.name}`}
            description={
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email:</p>
                  <p>{selectedMessage?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha:</p>
                  <p>{selectedMessage ? formatDate(selectedMessage.created_at) : ''}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mensaje:</p>
                  <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {selectedMessage?.message}
                  </div>
                </div>
              </div>
            }
            confirmText="Cerrar"
            cancelText=""
            onConfirm={() => setDetailDialogOpen(false)}
            showCancel={false}
            icon={Mail}
            iconColor="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20"
          />
        </CardContent>
      </Card>
    </div>
  );
}
