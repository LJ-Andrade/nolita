# Sistema de Notificaciones

## Queue Worker

Las notificaciones por email usan cola. El sistema crea un job con `Mail::queue()`, pero el mail no sale hasta que un worker procese la cola.

Configuracion esperada:

```env
QUEUE_CONNECTION=database
MAIL_MAILER=smtp
```

## Desarrollo Local

Desde `admin/backend`, levantar el entorno completo:

```bash
composer run dev
```

Ese script ejecuta:

```bash
php artisan serve
php artisan queue:listen --tries=1 --timeout=0
php artisan pail --timeout=0
npm run dev
```

Si solo hace falta procesar la cola:

```bash
php artisan queue:work
```

Para procesar un solo job pendiente y salir:

```bash
php artisan queue:work --once --tries=1
```

## Produccion Linux Con Supervisor

Instalar Supervisor:

```bash
sudo apt-get install supervisor
```

Crear configuracion:

```bash
sudo nano /etc/supervisor/conf.d/planb-worker.conf
```

Contenido recomendado:

```ini
[program:planb-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/planb/admin/backend/artisan queue:work database --sleep=3 --tries=3 --timeout=90
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/planb/admin/backend/storage/logs/worker.log
stopwaitsecs=3600
```

Aplicar cambios:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start planb-worker:*
sudo supervisorctl status
```

Reiniciar workers despues de deploy:

```bash
php artisan queue:restart
sudo supervisorctl restart planb-worker:*
```

## Produccion Linux Con Systemd

Crear servicio:

```bash
sudo nano /etc/systemd/system/planb-worker.service
```

Contenido recomendado:

```ini
[Unit]
Description=PlanB Laravel Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
RestartSec=10
WorkingDirectory=/var/www/planb/admin/backend
ExecStart=/usr/bin/php artisan queue:work database --sleep=3 --tries=3 --timeout=90

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable planb-worker
sudo systemctl start planb-worker
sudo systemctl status planb-worker
```

Reiniciar despues de deploy:

```bash
php artisan queue:restart
sudo systemctl restart planb-worker
```

## Desarrollo Local En Windows

Windows se usa solo para desarrollo local. No configurar workers de produccion en Windows para este proyecto.

Para procesar la cola durante desarrollo:

```powershell
php artisan queue:work database --sleep=3 --tries=3 --timeout=90
```

O levantar el entorno completo:

```powershell
composer run dev
```

Produccion corre en Debian. Usar Supervisor o systemd.

## Verificacion

Ver jobs pendientes:

```bash
php artisan tinker --execute="echo DB::table('jobs')->count();"
```

Ver jobs fallidos:

```bash
php artisan queue:failed
```

Reintentar jobs fallidos:

```bash
php artisan queue:retry all
```

Limpiar jobs fallidos:

```bash
php artisan queue:flush
```

Procesar un mail pendiente manualmente:

```bash
php artisan queue:work --once --tries=1
```

## Datos Iniciales

Cargar tipos de notificacion:

```bash
php artisan db:seed --class=NotificationTypeSeeder
```

Para detalles funcionales del sistema de notificaciones, ver `NOTIFICATIONS.md`.

## Troubleshooting

Si el email no llega:

1. Verificar que la preferencia este activada para el usuario.
2. Verificar que el tipo exista y este activo en `notification_types`.
3. Verificar que el usuario tenga un rol asociado al tipo en `notification_type_role`.
4. Verificar jobs pendientes en `jobs`.
5. Ejecutar `php artisan queue:work --once --tries=1`.
6. Si falla, revisar `storage/logs/laravel.log` y `php artisan queue:failed`.
7. Si el job queda en `DONE` pero no llega, revisar spam, remitente y configuracion SMTP.

Si la notificacion interna no aparece:

1. Verificar que el usuario tenga un rol asociado al tipo en `notification_type_role`.
2. Verificar que el tipo exista y este activo en `notification_types`.
3. Verificar que se haya creado una fila por usuario en `notifications`.
4. Recordar que el switch de preferencias controla email, no la campanita interna.
