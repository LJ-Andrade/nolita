# Sistema de Notificaciones

## Configuración de Queue (Cola de Trabajos)

### Producción

En producción, el queue worker no debe запускаться manualmente. Se usa un **process manager**:

### Opción 1: Supervisor (Recomendado)

Instalar supervisor:
```bash
sudo apt-get install supervisor
```

Crear archivo de configuración:
```bash
sudo nano /etc/supervisor/conf.d/laravel-worker.conf
```

Contenido:
```ini
[program:laravel-worker]
process_name=%(program_name)s
command=php /var/www/augusta/artisan queue:work --sleep=3 --tries=3 --timeout=90
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/laravel-worker.log
stopwaitsecs=3600
```

Aplicar cambios:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

Verificar estado:
```bash
sudo supervisorctl status
```

### Opción 2: Systemd

Crear archivo de servicio:
```bash
sudo nano /etc/systemd/system/laravel-worker.service
```

Contenido:
```ini
[Unit]
Description=Laravel Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
ExecStart=/usr/bin/php /var/www/augusta/artisan queue:work --sleep=3 --tries=3 --timeout=90
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Aplicar:
```bash
sudo systemctl daemon-reload
sudo systemctl enable laravel-worker
sudo systemctl start laravel-worker
```

### Desarrollo Local

Para desarrollo, usar:
```bash
php artisan queue:work
```

O con opción de auto-reinicio al detectar cambios:
```bash
php artisan queue:listen
```

### Monitoreo

Ver trabajos pendientes:
```bash
php artisan queue:monitor
```

Limpiar trabajos fallidos:
```bash
php artisan queue:flush
```

Ver trabajos fallidos:
```bash
php artisan queue:failed
```

Re-intentar trabajos fallidos:
```bash
php artisan queue:retry all
```

---

## Sistema de Notificaciones por Email

### Arquitectura

```
Evento (ej: nuevo pedido)
    → Observer detecta cambio
    → NotificationService.sendToSubscribers()
    → Filtra usuarios con permiso para ver notificación
    → Para cada usuario:
        → Verifica si está suscrito (email)
        → Si subscribed: encola AdminNotification
        → Crea notificación en base de datos (browser)
```

### Permisos de Notificaciones

Cada tipo de notificación tiene un `required_permission`:

| Tipo | Permiso Requerido |
|------|------------------|
| `order.created` | `view orders` |
| `order.updated` | `view orders` |
| `category.created` | `manage product categories` |
| `product.created` | `manage products` |

Para recibir una notificación, el usuario debe:
1. Tener el rol/permiso requerido
2. Estar suscrito a esa notificación

### Preferencias de Usuario

Los usuarios pueden activar/desactivar notificaciones desde:
- **Dropdown usuario** → Notificaciones → Preferencias
- **Perfil** → Sección Notificaciones

Por defecto:
- **Email**: DESACTIVADO - el usuario debe activar cada notificación explícitamente si quiere recibir emails
- **Browser**: ACTIVADO - el usuario recibe notificaciones en la campanita por defecto

### Tablas Involucradas

| Tabla | Propósito |
|-------|-----------|
| `notification_types` | Tipos de notificaciones disponibles |
| `user_notification_preferences` | Suscripciones por usuario |
| `notifications` | Notificaciones en el sistema (campanita) |

### Configuración de Mail

El sistema usa la configuración de mail del `.env`:
- `MAIL_MAILER` - driver (smtp, sendmail, etc.)
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`
- `MAIL_FROM_ADDRESS` - dirección remitente

### Troubleshooting

**Emails no se envían:**
1. Verificar que `queue:work` esté corriendo
2. Verificar `mail_to_address` en configuración
3. Revisar tabla `jobs` para trabajos pendientes
4. Revisar `failed_jobs` para errores

**Notificaciones no aparecen:**
1. Verificar `notification_types` en base de datos
2. Verificar permisos del usuario
3. Revisar que el evento se esté disparando

---

## Variables de Entorno Relacionadas

```env
# Queue
QUEUE_CONNECTION=database

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@example.com"
```