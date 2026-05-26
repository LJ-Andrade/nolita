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

const paymentStatuses = [
  { value: "unpaid", label: "Sin abonar" },
  { value: "processing", label: "En proceso" },
  { value: "paid", label: "Pagado" },
];

export default function OrderActionsCard({
  order,
  selectedStatus,
  onStatusChange,
  onUpdateStatus,
  selectedPaymentStatus,
  onPaymentStatusChange,
  onUpdatePaymentStatus,
  updating,
  updatingPayment,
  showPaymentStatus = false,
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
          <label htmlFor="order-status" className="text-sm font-medium">Estado del pedido</label>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger id="order-status">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full"
            onClick={() => onUpdateStatus(selectedStatus)}
            disabled={updating || !selectedStatus || selectedStatus === order.status}
          >
            {updating ? "Actualizando..." : "Aplicar estado"}
          </Button>
        </div>

        {showPaymentStatus && <div className="space-y-2">
          <label htmlFor="payment-status" className="text-sm font-medium">Estado de pago</label>
          <Select value={selectedPaymentStatus} onValueChange={onPaymentStatusChange}>
            <SelectTrigger id="payment-status">
              <SelectValue placeholder="Seleccionar estado de pago" />
            </SelectTrigger>
            <SelectContent>
              {paymentStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full"
            onClick={() => onUpdatePaymentStatus(selectedPaymentStatus)}
            disabled={updatingPayment || !selectedPaymentStatus || selectedPaymentStatus === order.payment_status}
          >
            {updatingPayment ? "Actualizando..." : "Aplicar estado de pago"}
          </Button>
        </div>}
      </CardContent>
    </Card>
  );
}
