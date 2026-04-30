import { useEffect, useState } from "react"
import { toast } from "sonner"
import axiosClient from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, Trash2, Check, X } from "lucide-react"
import { Link } from "react-router-dom"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = () => {
    axiosClient.get("notifications")
      .then(({ data }) => {
        setNotifications(data.notifications || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Error al cargar notificaciones")
        setLoading(false)
      })
  }

  const markAsRead = (notificationId) => {
    axiosClient.patch(`notifications/${notificationId}/read`)
      .then(() => {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read_at: new Date() } : n)
        )
        toast.success("Notificación marcada como leída")
      })
      .catch(() => {
        toast.error("Error al marcar como leída")
      })
  }

  const deleteNotification = (notificationId) => {
    setDeleting(notificationId)
    axiosClient.delete(`notifications/${notificationId}`)
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        toast.success("Notificación eliminada")
      })
      .catch(() => {
        toast.error("Error al eliminar notificación")
      })
      .finally(() => {
        setDeleting(null)
      })
  }

  const deleteAll = () => {
    axiosClient.delete("notifications")
      .then(() => {
        setNotifications([])
        toast.success("Todas las notificaciones eliminadas")
      })
      .catch(() => {
        toast.error("Error al eliminar notificaciones")
      })
  }

  const markAllAsRead = () => {
    axiosClient.patch("notifications/read-all")
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })))
        toast.success("Todas las notificaciones marcadas como leídas")
      })
      .catch(() => {
        toast.error("Error al marcar todas como leídas")
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
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Mis Notificaciones
            </CardTitle>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  Marcar todas leídas
                </Button>
                <Button variant="outline" size="sm" onClick={deleteAll} className="text-red-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar todas
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.read_at
                      ? "bg-card/30 opacity-60"
                      : "bg-card/50 border-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!notification.read_at && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                        <h4 className="font-medium truncate">{notification.title}</h4>
                      </div>
                      {notification.message && (
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          title="Marcar como leída"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        disabled={deleting === notification.id}
                        className="text-red-500 hover:text-red-400"
                        title="Eliminar"
                      >
                        {deleting === notification.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Preferencias de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Gestiona qué notificaciones quieres recibir.
          </p>
          <Link to="/perfil/notificaciones">
            <Button variant="outline">Configurar Preferencias</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}