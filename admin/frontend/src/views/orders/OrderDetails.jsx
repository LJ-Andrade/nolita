import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  CreditCard,
  User,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ReceiptText,
  MessageSquareText,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from "@/components/page-header";
import { SectionActionsBar } from "@/components/section-actions-bar";
import OrderActionsCard from "./OrderActionsCard";

const emptyValue = "-";
const showPaymentStatus = false;

function formatMoney(value) {
  const amount = Number.parseFloat(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `$ ${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount)}`;
}

function formatDateTime(value) {
  if (!value) return emptyValue;

  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getStatusBadge(status) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="mr-1 h-3 w-3" /> Completada</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><RefreshCw className="mr-1 h-3 w-3" /> Procesando</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="mr-1 h-3 w-3" /> Cancelada</Badge>;
    default:
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="mr-1 h-3 w-3" /> Pendiente</Badge>;
  }
}

function getPaymentStatusBadge(status) {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="mr-1 h-3 w-3" /> Pagado</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><RefreshCw className="mr-1 h-3 w-3" /> En proceso</Badge>;
    default:
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="mr-1 h-3 w-3" /> Sin abonar</Badge>;
  }
}



function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || emptyValue}</span>
    </div>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [exportingFormat, setExportingFormat] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axiosClient.get(`admin/orders/${id}`);
      setOrder(response.data);
      setSelectedStatus(response.data.status || "pending");
      setSelectedPaymentStatus(response.data.payment_status || "unpaid");
    } catch (error) {
      toast.error('Error al cargar la orden');
      navigate('/pedidos');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await axiosClient.put(`admin/orders/${id}`, { status: newStatus });
      toast.success('Estado actualizado correctamente');
      setOrder({ ...order, status: newStatus });
      setSelectedStatus(newStatus);
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newStatus) => {
    setUpdatingPayment(true);
    try {
      await axiosClient.put(`admin/orders/${id}`, { payment_status: newStatus });
      toast.success('Estado de pago actualizado correctamente');
      setOrder({ ...order, payment_status: newStatus });
      setSelectedPaymentStatus(newStatus);
    } catch (error) {
      toast.error('Error al actualizar el estado de pago');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const exportOrder = async (format) => {
    setExportingFormat(format);
    try {
      const response = await axiosClient.get(`admin/orders/${id}/export`, {
        params: { format },
        responseType: "blob",
      });

      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `order-${id}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);

      toast.success(`Orden exportada en ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Error al exportar la orden");
    } finally {
      setExportingFormat(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) return <div>Orden no encontrada</div>;

  const items = order.items || [];
  const subtotal = items.reduce((total, item) => total + Number.parseFloat(item.subtotal || 0), 0);
  const discount = Number.parseFloat(order.coupon_discount_amount || 0);
  const deliveryFee = Number.parseFloat(order.shipping_address?.delivery_fee || 0);
  const paymentFee = Number.parseFloat(order.billing_address?.payment_fee || 0);

  return (
    <div className="space-y-6">
      <div>
        <PageHeader
          breadcrumbs={[
            { label: 'PEDIDOS', href: '/pedidos' },
            { label: `Orden #${order.id}` },
          ]}
          actions={<div className="flex items-center gap-2">{getStatusBadge(order.status)}{showPaymentStatus && getPaymentStatusBadge(order.payment_status)}</div>}
        />
        <p className="text-sm text-muted-foreground -mt-3">
          Creada {formatDateTime(order.created_at)} · Actualizada {formatDateTime(order.updated_at)}
        </p>
      </div>

      <SectionActionsBar>
        <Button
          type="button"
          variant="outline"
          onClick={() => exportOrder("pdf")}
          disabled={Boolean(exportingFormat)}
        >
          <ReceiptText className="h-4 w-4" />
          {exportingFormat === "pdf" ? "Exportando..." : "Exportar en PDF"}
        </Button>
      </SectionActionsBar>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Artículos
              </CardTitle>
              <CardDescription>
                {items.length} artículo{items.length === 1 ? "" : "s"} agregado{items.length === 1 ? "" : "s"} al pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Variante</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Unitario</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Sin artículos registrados.
                        </TableCell>
                      </TableRow>
                    )}
                    {items.map((item) => {
                      const variantParts = [
                        item.variant?.color?.name,
                        item.variant?.size?.name,
                      ].filter(Boolean);

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.product_name || emptyValue}</div>
                            <div className="text-xs text-muted-foreground">Producto #{item.product_id || emptyValue}</div>
                          </TableCell>
                          <TableCell>{variantParts.length ? variantParts.join(" / ") : emptyValue}</TableCell>
                          <TableCell className="font-mono text-xs">{item.variant?.sku || emptyValue}</TableCell>
                          <TableCell className="text-right">{item.quantity || 0}</TableCell>
                          <TableCell className="text-right">{formatMoney(item.unit_price)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatMoney(item.subtotal)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5" /> Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <DetailRow label="Subtotal" value={formatMoney(subtotal)} />
                <DetailRow label="Cupón" value={order.coupon_code || emptyValue} />
                <DetailRow label="Descuento" value={discount > 0 ? `- ${formatMoney(discount)}` : formatMoney(0)} />
                <DetailRow label="Envío" value={formatMoney(deliveryFee)} />
                <DetailRow label="Ajuste método de pago" value={formatMoney(paymentFee)} />
                <Separator className="my-2" />
                <div className="flex items-center justify-between gap-4 pt-2">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-xl">{formatMoney(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5" /> Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <OrderActionsCard
            order={order}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onUpdateStatus={updateStatus}
            updating={updating}
            selectedPaymentStatus={selectedPaymentStatus}
            onPaymentStatusChange={setSelectedPaymentStatus}
            onUpdatePaymentStatus={updatePaymentStatus}
            updatingPayment={updatingPayment}
            showPaymentStatus={showPaymentStatus}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Datos del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {(() => {
                const cd = order.customer_data || {};
                const name = order.customer?.name || cd.name;
                const email = order.customer?.email || cd.email;
                const phone = order.customer?.phone || cd.phone;
                return (
                  <>
                    <DetailRow label="Nombre" value={name} />
                    <DetailRow label="Email" value={email} />
                    <DetailRow label="Teléfono" value={phone} />
                    {cd.whatsapp && <DetailRow label="WhatsApp" value={cd.whatsapp} />}
                    {cd.cuit && <DetailRow label="CUIT" value={cd.cuit} />}
                    {cd.address && (
                      <>
                        <Separator className="my-2" />
                        <DetailRow label="Dirección" value={cd.address} />
                        <DetailRow label="Localidad" value={cd.locality || cd.city} />
                        <DetailRow label="Provincia" value={cd.province} />
                        <DetailRow label="Código postal" value={cd.postal_code} />
                      </>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Pago y Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <DetailRow label="Método de pago" value={order.billing_address?.payment_method_name || order.payment_method || emptyValue} />
              <DetailRow label="Ajuste pago" value={formatMoney(order.billing_address?.payment_fee)} />
              {order.coupon_code && (
                <DetailRow label="Cupón aplicado" value={<span className="inline-flex items-center gap-1"><Tag className="h-3 w-3" /> {order.coupon_code}</span>} />
              )}
              <Separator className="my-2" />
              <DetailRow label="Método de entrega" value={order.shipping_address?.delivery_method_name || order.shipping_address?.delivery_method_id || emptyValue} />
              <DetailRow label="Costo de envío" value={formatMoney(order.shipping_address?.delivery_fee)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
