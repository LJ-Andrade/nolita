import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard,
  User,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axiosClient.get(`admin/orders/${id}`);
      setOrder(response.data);
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
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!order) return <div>Orden no encontrada</div>;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="mr-1 h-3 w-3"/> Completada</Badge>;
      case 'processing': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><RefreshCw className="mr-1 h-3 w-3"/> Procesando</Badge>;
      case 'cancelled': return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="mr-1 h-3 w-3"/> Cancelada</Badge>;
      default: return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="mr-1 h-3 w-3"/> Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/pedidos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Orden #{order.id}
            {getStatusBadge(order.status)}
          </h1>
          <p className="text-muted-foreground mt-1">
            Realizada el {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {order.status !== 'completed' && order.status !== 'cancelled' && (
             <Button variant="outline" onClick={() => updateStatus('completed')} disabled={updating}>
               Marcar Completa
             </Button>
          )}
          {order.status !== 'cancelled' && (
             <Button variant="destructive" onClick={() => updateStatus('cancelled')} disabled={updating}>
               Cancelar
             </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.product_name}</span>
                      <span className="text-sm text-muted-foreground">Cant: {item.quantity} x ${parseFloat(item.unit_price || 0).toFixed(2)}</span>
                    </div>
                    <span className="font-semibold">${parseFloat(item.subtotal || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t border-dashed">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg">${parseFloat(order.total_amount || 0).toFixed(2)} {order.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <div className="space-y-1">
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Usuario Invitado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
               <p className="font-medium capitalize">{order.payment_method || 'N/A'}</p>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <MapPin className="h-5 w-5" /> Envío
               </CardTitle>
             </CardHeader>
             <CardContent>
               {order.shipping_address ? (
                 <div className="space-y-1 text-sm">
                   <p>{order.shipping_address.name}</p>
                   <p>{order.shipping_address.address}</p>
                   <p>{order.shipping_address.city} {order.shipping_address.postal_code}</p>
                   <p>{order.shipping_address.phone}</p>
                 </div>
               ) : (
                 <p className="text-muted-foreground text-sm">Sin dirección especificada</p>
               )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
