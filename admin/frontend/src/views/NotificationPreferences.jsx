import { useEffect, useState } from "react"
import { toast } from "sonner"
import axiosClient from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"

export default function NotificationPreferences() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notificationTypes, setNotificationTypes] = useState([])
  const [preferences, setPreferences] = useState({})

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = () => {
    axiosClient.get("notification-preferences")
      .then(({ data }) => {
        setNotificationTypes(data.notification_types || [])
        const prefs = {}
        data.notification_types?.forEach((type) => {
          prefs[type.id] = {
            email_enabled: type.email_enabled,
            browser_enabled: type.browser_enabled,
          }
        })
        setPreferences(prefs)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Error al cargar preferencias")
        setLoading(false)
      })
  }

  const handleToggle = (typeId, channel) => {
    const field = `${channel}_enabled`

    setPreferences((prev) => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [field]: !prev[typeId]?.[field],
      },
    }))

    axiosClient.post(`notification-preferences/${typeId}/toggle`, { channel })
      .then(({ data }) => {
        setPreferences((prev) => ({
          ...prev,
          [typeId]: {
            ...prev[typeId],
            [field]: data.enabled,
          },
        }))
        toast.success(data.enabled ? "Suscripción activada" : "Suscripción desactivada")
      })
      .catch(() => {
        setPreferences((prev) => ({
          ...prev,
          [typeId]: {
            ...prev[typeId],
            [field]: !prev[typeId]?.[field],
          },
        }))
        toast.error("Error al actualizar preferencias")
      })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Preferencias de Notificaciones"
        breadcrumbs={[
          { label: 'PERFIL' },
          { label: 'Preferencias de Notificaciones' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Preferencias de Notificaciones
          </CardTitle>
          <CardDescription>
            Configura qué notificaciones quieres recibir. Solo verás las notificaciones
            disponibles según tus permisos.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {notificationTypes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay notificaciones disponibles.
            </p>
          ) : (
            <div className="space-y-4">
              {notificationTypes.map((type) => (
                <div key={type.id} className="flex items-start justify-between p-4 rounded-lg border bg-card/30">
                  <div className="space-y-1">
                    <h4 className="font-medium">{type.name}</h4>
                    {type.description && (
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={preferences[type.id]?.email_enabled ?? false}
                        onCheckedChange={() => handleToggle(type.id, "email")}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
