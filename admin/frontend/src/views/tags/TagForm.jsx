import { useNavigate, useParams } from 'react-router-dom';
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

export default function TagForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const formSchema = z.object({
    name: z.string().min(1, "El nombre debe tener al menos 2 caracteres."),
  });

  const { form, loading, fetching, entityName, onSubmit } = useCrudForm({
    endpoint: 'tags',
    id,
    schema: formSchema,
    defaultValues: {
      name: '',
    },
    onSuccess: () => navigate('/etiquetas'),
    messages: {
      createSuccess: "Etiqueta creada correctamente",
      updateSuccess: "Etiqueta actualizada correctamente",
      createError: "Error al crear la etiqueta",
      updateError: "Error al actualizar la etiqueta",
    },
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
        title={
          id
            ? `${"Editando etiqueta"} "${entityName}"`
            : "Crear Nueva Etiqueta"
        }
        breadcrumbs={[
          { label: 'BLOG' },
          { label: "Etiquetas" || 'Etiquetas', href: '/tags' },
          { label: id ? "Editar" : "Crear" },
        ]}
      />

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {id
                    ? `${"Editando etiqueta"} "${entityName}"`
                    : "Crear Nueva Etiqueta"}
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
                        <Input placeholder={"Nombre de la Etiqueta"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => navigate('/etiquetas')}>
                    <X className="mr-2 h-4 w-4" />
                    {"Cancelar"}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {id ? "Actualizar Etiqueta" : "Crear Etiqueta"}
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
