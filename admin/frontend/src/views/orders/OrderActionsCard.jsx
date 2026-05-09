import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2 } from "lucide-react";

const orderStatuses = [
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "Procesando" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

export default function OrderActionsCard({
  order,
  selectedStatus,
  onStatusChange,
  onUpdateStatus,
  updating,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" /> Acciones
        </CardTitle>
        <CardDescription>
          Operaciones disponibles para este pedido
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="order-status" className="text-sm font-medium">Estado</label>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger id="order-status">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full"
          onClick={() => onUpdateStatus(selectedStatus)}
          disabled={updating || !selectedStatus || selectedStatus === order.status}
        >
          {updating ? "Actualizando..." : "Aplicar estado"}
        </Button>
      </CardContent>
    </Card>
  );
}
