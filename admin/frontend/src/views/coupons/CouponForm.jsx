import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as z from 'zod';
import { format } from 'date-fns';
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
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, Save, X } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useCrudForm } from '@/hooks/use-crud-form';
import axiosClient from '@/lib/axios';
import { toast } from 'sonner';

const formSchema = z.object({
  code: z.string().min(1, 'Este campo es requerido').toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed']),
  amount: z.number({ invalid_type_error: 'Este campo es requerido' }).min(0, 'El monto debe ser mayor o igual a 0'),
  expires_at: z.date().optional().nullable(),
  active: z.boolean().default(true),
}).superRefine((values, ctx) => {
  if (values.discount_type === 'percentage' && values.amount > 100) {
    ctx.addIssue({
      code: 'custom',
      path: ['amount'],
      message: 'El porcentaje no puede superar 100',
    });
  }
});

function parseDate(value) {
  if (!value || value instanceof Date) return value ?? null;

  const dateStr = value.split('T')[0];
  const [year, month, day] = dateStr.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export default function CouponForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [saving, setSaving] = React.useState(false);
  const { form, fetching, entityName, setEntityName } = useCrudForm({
    endpoint: 'coupons',
    id,
    schema: formSchema,
    defaultValues: {
      code: '',
      discount_type: 'percentage',
      amount: 0,
      expires_at: null,
      active: true,
    },
    onSuccess: () => navigate('/cupones'),
    messages: {
      createSuccess: 'Cupón creado correctamente',
      updateSuccess: 'Cupón actualizado correctamente',
      createError: 'Error al crear el cupón',
      updateError: 'Error al actualizar el cupón',
    },
  });
  const discountType = form.watch('discount_type');

  React.useEffect(() => {
    if (!id || fetching || !form.getValues('code')) return;

    const currentValues = form.getValues();

    if (typeof currentValues.amount === 'string') {
      form.setValue('amount', Number(currentValues.amount));
    }

    if (currentValues.expires_at && typeof currentValues.expires_at === 'string') {
      form.setValue('expires_at', parseDate(currentValues.expires_at));
    }

    setEntityName(currentValues.code || '');
  }, [id, fetching, form, setEntityName]);

  const handleSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof Date) {
        formData.append(key, format(value, 'yyyy-MM-dd'));
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (id) {
      formData.append('_method', 'PUT');
    }

    try {
      const response = id
        ? await axiosClient.post(`coupons/${id}`, formData)
        : await axiosClient.post('coupons', formData);

      toast.success(id ? 'Cupón actualizado correctamente' : 'Cupón creado correctamente');
      navigate('/cupones');
      window.dispatchEvent(new CustomEvent('refresh-coupons'));

      return response;
    } catch (error) {
      const serverErrors = error.response?.data?.errors;

      if (serverErrors) {
        Object.entries(serverErrors).forEach(([field, messages]) => {
          form.setError(field, {
            type: 'server',
            message: Array.isArray(messages) ? messages[0] : messages,
          });
        });
      } else {
        toast.error(id ? 'Error al actualizar el cupón' : 'Error al crear el cupón');
      }

      throw error;
    } finally {
      setSaving(false);
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
        title={id ? `Editando cupón "${entityName}"` : 'Crear Cupón'}
        breadcrumbs={[
          { label: 'PRODUCTOS' },
          { label: 'Cupones', href: '/cupones' },
          { label: id ? 'Editar' : 'Crear' },
        ]}
      />

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {id ? `Editando cupón "${entityName}"` : 'Crear Cupón'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: DESCUENTO20"
                          onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="discount_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de descuento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Porcentaje</SelectItem>
                            <SelectItem value="fixed">Valor fijo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{discountType === 'percentage' ? 'Porcentaje' : 'Monto'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {discountType === 'fixed' && (
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                $
                              </span>
                            )}
                            <Input
                              {...field}
                              type="number"
                              inputMode="decimal"
                              min="0"
                              max={discountType === 'percentage' ? '100' : undefined}
                              step="0.01"
                              placeholder={discountType === 'percentage' ? 'Ej: 20' : 'Ej: 1500'}
                              className={discountType === 'fixed' ? 'pl-7' : 'pr-9'}
                              onChange={(event) => field.onChange(event.target.value === '' ? 0 : Number(event.target.value))}
                            />
                            {discountType === 'percentage' && (
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                %
                              </span>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de expiración</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Activo
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => navigate('/cupones')}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
