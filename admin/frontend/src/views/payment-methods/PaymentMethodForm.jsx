import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useCrudForm } from '@/hooks/use-crud-form';
import axiosClient from '@/lib/axios';
import { toast } from 'sonner';

export default function PaymentMethodForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const formSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    status: z.string().min(1, 'El estado es requerido'),
    fee: z.number().min(0, 'La comisión debe ser mayor o igual a 0').default(0),
    price_mode_scope: z.enum(['both', 'retail', 'wholesale']).default('both'),
  });

  const { form, loading, fetching, entityName, setEntityName } = useCrudForm({
    endpoint: 'payment-methods',
    id,
    schema: formSchema,
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      fee: 0,
      price_mode_scope: 'both',
    },
    onSuccess: () => {},
    messages: {
      createSuccess: 'Método de pago creado correctamente',
      updateSuccess: 'Método de pago actualizado correctamente',
      createError: 'Error al crear el método de pago',
      updateError: 'Error al actualizar el método de pago',
    },
  });

  // Set title when data is loaded
  React.useEffect(() => {
    if (id && !fetching && form.getValues('name')) {
      setEntityName(form.getValues('name'));
    }
  }, [id, fetching, form.getValues('name'), setEntityName]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (id) {
      formData.append('_method', 'PUT');
    }

    try {
      const response = id
        ? await axiosClient.post(`payment-methods/${id}`, formData)
        : await axiosClient.post('payment-methods', formData);

      toast.success(id ? 'Método de pago actualizado correctamente' : 'Método de pago creado correctamente');
      navigate('/metodos-pago');
      return response;
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        Object.entries(serverErrors).forEach(([key, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(key, { message });
        });
      } else {
        toast.error(id ? 'Error al actualizar el método de pago' : 'Error al crear el método de pago');
      }
      throw error;
    }
  });

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? `Editando "${entityName}"` : 'Crear Método de Pago'}
        breadcrumbs={[
          { label: 'TIENDA' },
          { label: 'Métodos de Pago', href: '/metodos-pago' },
          { label: id ? 'Editar' : 'Crear' },
        ]}
      />

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {id ? `Editar Método de Pago "${entityName}"` : 'Nuevo Método de Pago'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Tarjeta de Crédito" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_mode_scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar canal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="both">Mayorista y minorista</SelectItem>
                          <SelectItem value="retail">Minorista</SelectItem>
                          <SelectItem value="wholesale">Mayorista</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comisión (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Ej: 10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => navigate('/metodos-pago')}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {id ? 'Guardar' : 'Crear'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
