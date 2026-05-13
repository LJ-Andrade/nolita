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
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { PageHeader } from "@/components/page-header";

const ROLE_LABELS = {
  "Super Admin": "Super Administrador",
  Admin: "Administrador",
  Employee: "Empleado",
};

const getRoleLabel = (role) => role.display_name || ROLE_LABELS[role.name] || role.name;

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [roles, setRoles] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [pendingAvatar, setPendingAvatar] = useState(null);

  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    password: id 
      ? z.string().optional().or(z.literal(""))
      : z.string().min(6, "Password must be at least 6 characters."),
    role_ids: z.array(z.number()).default([]),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role_ids: [],
    },
  });

  useEffect(() => {
    // Fetch all available roles
    axiosClient.get("users/assignable-roles").then(({ data }) => {
      setRoles(data.data || []);
    }).catch(error => {
      console.error("Error fetching roles:", error);
    });

    if (id) {
      setFetching(true);
      axiosClient
        .get(`users/${id}`)
        .then(({ data }) => {
          form.reset({
            name: data.data.name,
            email: data.data.email,
            password: "",
            role_ids: data.data.roles?.map(role => role.id) || [],
          });
          setAvatarUrl(data.data.avatar_url);
          setFetching(false);
        })
        .catch(() => {
          setFetching(false);
        });
    }
  }, [id, form]);

  const handleAvatarChange = async (file) => {
    if (!id) {
      setPendingAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await axiosClient.post(`users/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAvatarUrl(`${data.data.avatar_url}?t=${new Date().getTime()}`);
      toast.success("Avatar actualizado correctamente" || "Avatar updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Error al actualizar el avatar" || "Failed to update avatar");
    }
  };

  const onSubmit = (values) => {
    setLoading(true);
    const payload = { ...values };
    if (id && !payload.password) {
      delete payload.password;
    }

    let request;
    if (!id && pendingAvatar) {
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        if (Array.isArray(payload[key])) {
          payload[key].forEach((val) => formData.append(`${key}[]`, val));
        } else {
          formData.append(key, payload[key]);
        }
      });
      formData.append("avatar", pendingAvatar);
      request = axiosClient.post("users", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      request = id
        ? axiosClient.put(`users/${id}`, payload)
        : axiosClient.post("users", payload);
    }

    request
      .then(() => {
        toast.success(id ? "Usuario actualizado correctamente" : "Usuario creado correctamente");
        navigate('/usuarios');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={id ? "Editar Usuario" : "Nuevo Usuario"}
        breadcrumbs={[
          { label: 'USUARIOS' },
          { label: id ? "Editar" : "Crear" },
        ]}
      />
      <div className="max-w-2xl pb-10">
      <Card>
        <CardHeader>
          <CardTitle>{id ? "Editar Usuario" : "Nuevo Usuario"}</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center pb-6 border-b">
                <AvatarUpload 
                  value={avatarUrl} 
                  onChange={handleAvatarChange}
                />
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Nombre"}</FormLabel>
                      <FormControl>
                        <Input placeholder={"Nombre Completo"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Correo"}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={"Correo electrónico"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Contraseña"} {id && "(dejar en blanco para mantener la actual)"}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={"Contraseña"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role_ids"
                  render={() => (
                    <FormItem className="pt-4 border-t">
                      <FormLabel className="text-sm font-medium mb-3 block">{"Roles"}</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {roles.map((role) => (
                          <FormField
                            key={role.id}
                            control={form.control}
                            name="role_ids"
                            render={({ field }) => (
                              <FormItem
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(role.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, role.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== role.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {getRoleLabel(role)}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/usuarios')}
                  >
                    {"Cancelar"}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {id ? "Actualizar Usuario" : "Crear Usuario"}
                  </Button>
                </div>
              </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);
}
