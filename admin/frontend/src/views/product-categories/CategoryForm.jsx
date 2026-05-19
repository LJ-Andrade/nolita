import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosClient from '@/lib/axios';
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
import { ImageUpload } from '@/components/ui/image-upload';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const CATEGORY_IMAGE_UPLOAD_ENABLED = false;

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [pendingCover, setPendingCover] = useState(null);

  const formSchema = z.object({
    name: z.string().min(1, "El nombre debe tener al menos 1 caracter."),
    slug: z.string().nullable(),
    listed: z.boolean().default(false),
    order: z.coerce.number().int().default(0),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      listed: false,
      order: 0,
    },
  });

  useEffect(() => {
    if (id) {
      setFetching(true);
      axiosClient
        .get(`product-categories/${id}`)
        .then(({ data }) => {
          const entityData = data.data || data;
          form.reset({
            name: entityData.name || '',
            slug: entityData.slug || '',
            listed: entityData.listed || false,
            order: entityData.order || 0,
          });
          setEntityName(entityData.name || '');
          if (entityData.image) {
            setPendingCover(entityData.image);
          }
          setFetching(false);
        })
        .catch(() => {
          toast.error("Error al cargar la categoría");
          setFetching(false);
        });
    }
  }, [id, form]);

  const onSubmit = async (values) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('slug', values.slug || '');
      formData.append('listed', values.listed ? '1' : '0');
      formData.append('order', String(values.order || 0));

      if (CATEGORY_IMAGE_UPLOAD_ENABLED && pendingCover instanceof File) {
        formData.append('image', pendingCover);
      }

      let response;

      if (id) {
        formData.append('_method', 'PUT');
        response = await axiosClient.post(`product-categories/${id}`, formData);
        toast.success("Categoría actualizada correctamente");
      } else {
        response = await axiosClient.post('product-categories', formData);
        toast.success("Categoría creada correctamente");
      }

      navigate('/productos-categorias');
      return response;
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        Object.entries(serverErrors).forEach(([key, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(key, { message });
        });
      } else {
        toast.error(id ? "Error al actualizar la categoría" : "Error al crear la categoría");
      }
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

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
            ? `Editando Categoría ${entityName}`
            : "Crear Nueva Categoría"
        }
        breadcrumbs={[
          { label: 'PRODUCTOS' },
          { label: "Categorías", href: '/productos-categorias' },
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
                    ? `Editando Categoría ${entityName}`
                    : "Crear Nueva Categoría"}
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
                        <Input
                          {...field}
                          placeholder={"Nombre de la categoría..."}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Slug"}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={"Slug"}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {CATEGORY_IMAGE_UPLOAD_ENABLED && (
                  <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                      <FormItem>
                        <FormLabel>{"Imagen"}</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={pendingCover}
                            onChange={(file) => {
                              setPendingCover(file);
                            }}
                            disabled={loading}
                            aspect={1}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Orden"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || 0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="listed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{"Mostrar en home"}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/productos-categorias')}
                  >
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
