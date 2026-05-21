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
import { Loader2, Save, X } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useCrudForm } from '@/hooks/use-crud-form';

export default function ProductColorForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const formSchema = z.object({
    name: z.string().min(1, "El nombre debe tener al menos 2 caracteres." || 'El nombre es requerido'),
    hex_color: z.string().regex(/^#[a-fA-F0-9]{6}$/, "Formato de color inválido (use #RRGGBB)" || 'Formato de color inválido (use #RRGGBB)'),
  });

  const { form, loading, fetching, entityName, onSubmit } = useCrudForm({
    endpoint: 'product-colors',
    id,
    schema: formSchema,
    defaultValues: {
      name: '',
      hex_color: '#000000',
    },
    onSuccess: () => navigate('/productos-colores'),
    messages: {
      createSuccess: "Color creado correctamente" || 'Color creado correctamente',
      updateSuccess: "Color actualizado correctamente" || 'Color actualizado correctamente',
      createError: "Error al crear el color" || 'Error al crear el color',
      updateError: "Error al actualizar el color" || 'Error al actualizar el color',
    },
  });

  const title = id ? `Editando color "${entityName}"` : "Crear Color";

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
        title={title}
        breadcrumbs={[
          { label: 'PRODUCTOS' },
          { label: "Colores" || 'Colores', href: '/productos-colores' },
          { label: id ? "Editar" : "Crear" },
        ]}
      />

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Nombre"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={"Ej: Rojo"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hex_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Color"}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            {...field}
                            className="w-16 h-10 rounded cursor-pointer border border-input"
                          />
                          <Input
                            {...field}
                            placeholder="#FF0000"
                            className="flex-1 uppercase"
                            maxLength={7}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => navigate('/productos-colores')}>
                    <X className="mr-2 h-4 w-4" />
                    {"Cancelar"}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {id ? "Guardar" : "Crear"}
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
