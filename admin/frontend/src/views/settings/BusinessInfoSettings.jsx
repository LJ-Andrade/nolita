import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle, Facebook, Instagram, Linkedin, Youtube, Video, Save } from "lucide-react";
import { PageHeader } from "@/components/page-header";

const BUSINESS_SECTION = "business";

const BUSINESS_FIELDS = [
  { key: "business_phone", label: "Telefono", icon: Phone, type: "tel", contentType: "text", placeholder: "+54 11 1234-5678" },
  { key: "business_email", label: "Email", icon: Mail, type: "email", contentType: "text", placeholder: "contacto@empresa.com" },
  { key: "business_address", label: "Direccion", icon: MapPin, type: "text", contentType: "text", placeholder: "Direccion comercial" },
  { key: "business_hours", label: "Horarios", icon: Clock, type: "textarea", contentType: "text", placeholder: "Lunes a Viernes: 9:00 - 18:00" },
  { key: "business_whatsapp", label: "WhatsApp", icon: MessageCircle, type: "tel", contentType: "text", placeholder: "+54 9 11 1234 5678" },
  { key: "business_facebook", label: "Facebook", icon: Facebook, type: "url", contentType: "url", placeholder: "https://facebook.com/tuempresa" },
  { key: "business_instagram", label: "Instagram", icon: Instagram, type: "url", contentType: "url", placeholder: "https://instagram.com/tuempresa" },
  { key: "business_linkedin", label: "LinkedIn", icon: Linkedin, type: "url", contentType: "url", placeholder: "https://linkedin.com/company/tuempresa" },
  { key: "business_youtube", label: "YouTube", icon: Youtube, type: "url", contentType: "url", placeholder: "https://youtube.com/@tuempresa" },
  { key: "business_tiktok", label: "TikTok", icon: Video, type: "url", contentType: "url", placeholder: "https://tiktok.com/@tuempresa" },
];

function buildSettingsMap(items = []) {
  const settingsMap = {};

  BUSINESS_FIELDS.forEach((field) => {
    const content = items.find((item) => item.key === field.key);
    settingsMap[field.key] = {
      key: field.key,
      value: content?.value || "",
      section: content?.section || BUSINESS_SECTION,
      type: content?.type || field.contentType,
      description: content?.description || "",
    };
  });

  return settingsMap;
}

export default function BusinessInfoSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosClient.get("/site-content", { params: { section: BUSINESS_SECTION } })
      .then(({ data }) => {
        setSettings(buildSettingsMap(data.data));
        setLoading(false);
      })
      .catch(() => {
        setSettings(buildSettingsMap());
        setLoading(false);
      });
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const contents = BUSINESS_FIELDS.map((field) => ({
        key: field.key,
        value: settings[field.key]?.value || "",
        section: BUSINESS_SECTION,
        type: field.contentType,
      }));

      await axiosClient.put("/site-content/bulk", { contents });
      toast.success("Guardado correctamente");
    } catch {
      toast.error("Ocurrio un error");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  if (loading) {
    return <div className="p-8 text-center">{"Cargando..."}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={"Informacion de Negocio"}
        breadcrumbs={[
          { label: "CONFIGURACION" },
          { label: "Informacion de Negocio" },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{"Datos de contacto"}</CardTitle>
          <Button onClick={handleSaveAll} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {"Guardar Cambios"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {BUSINESS_FIELDS.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  <Label htmlFor={field.key} className="mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {field.label}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.key}
                      value={settings[field.key]?.value || ""}
                      onChange={(e) => updateSetting(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type}
                      value={settings[field.key]?.value || ""}
                      onChange={(e) => updateSetting(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
