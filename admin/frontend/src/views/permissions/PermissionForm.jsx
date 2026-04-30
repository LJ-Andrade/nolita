import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Save, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function PermissionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [permissionName, setPermissionName] = useState("");

  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (id) {
      setFetching(true);
      axiosClient
        .get(`permissions/${id}`)
        .then(({ data }) => {
          form.reset({
            name: data.data.name,
          });
          setPermissionName(data.data.name);
          setFetching(false);
        })
        .catch(() => {
          setFetching(false);
        });
    }
  }, [id, form]);

  const onSubmit = (values) => {
    setLoading(true);
    const request = id
      ? axiosClient.put(`permissions/${id}`, values)
      : axiosClient.post("permissions", values);

    request
      .then(() => {
        toast.success(id ? "Permiso actualizado correctamente" : "Permiso creado correctamente");
        navigate('/permisos');
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          const errors = error.response.data.errors;
          Object.keys(errors).forEach((key) => {
            form.setError(key, {
              type: "manual",
              message: errors[key][0],
            });
          });
        }
        setLoading(false);
      });
  };

  const title = id ? `Editando permiso "${permissionName}"` : "Crear Permiso";

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'PERMISOS', href: '/permisos' },
          { label: id ? "Editar" : "Crear" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Nombre"}</FormLabel>
                      <FormControl>
                        <Input placeholder={"Nombre del Permiso"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/permisos')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {"Cancelar"}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (id ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                    {id ? "Actualizar Permiso" : "Crear Permiso"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
