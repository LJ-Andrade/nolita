# Sistema de Notificaciones

## Flujo De Email

```txt
Evento, por ejemplo crear categoria o completar pedido
-> Observer detecta el cambio
-> NotificationService::sendToSubscribers()
-> Filtra usuarios por rol del NotificationType
-> Crea una notificacion interna para cada usuario elegible
-> Si el usuario activo email, Mail::queue(new AdminNotification(...))
-> Worker procesa job
-> SMTP envia email
```

## Tipos De Notificacion

Los tipos se definen en:

```txt
database/seeders/NotificationTypeSeeder.php
```

Se cargan con:

```bash
php artisan db:seed --class=NotificationTypeSeeder
```

## Roles Por Tipo De Notificacion

Cada tipo define que roles pueden verlo desde el seeder:

```php
[
    'key' => 'order.created',
    'name' => 'Nuevo Pedido',
    'description' => 'Se recibe un nuevo pedido en el sistema',
    'roles' => ['Super Admin', 'Admin', 'Employee'],
],
```

El seeder sincroniza esos roles en la tabla pivot:

```txt
notification_type_role
```

Cuando se dispara una notificacion, `NotificationService` evalua cada usuario con:

```php
$user->canReceiveNotification($notificationType)
```

Reglas:

1. Si el tipo tiene `required_permission`, el usuario debe tener ese permiso.
2. Si el tipo tiene roles asociados, el usuario debe tener al menos uno.
3. Si el tipo no tiene roles asociados, queda disponible para todos los usuarios elegibles.
4. El switch de preferencias no controla visibilidad por rol; solo controla si se envia email.
5. La campanita interna se crea individualmente para cada usuario elegible.

Tipos actuales:

| Tipo | Roles |
| --- | --- |
| `order.created` | `Super Admin`, `Admin`, `Employee` |
| `order.updated` | `Super Admin`, `Admin`, `Employee` |
| `category.created` | `Super Admin`, `Admin` |
| `product.created` | `Super Admin`, `Admin`, `Employee` |

Para modificar visibilidad, editar `NotificationTypeSeeder` y ejecutar:

```bash
php artisan db:seed --class=NotificationTypeSeeder
```

## Preferencias De Usuario

Las preferencias por usuario se guardan en:

```txt
user_notif_prefs
```

Reglas:

1. Email esta desactivado por defecto.
2. La campanita interna esta activada por defecto.
3. El switch visible en Preferencias de Notificaciones controla email.
4. La campanita interna no depende del switch de email.

## Tablas Principales

| Tabla | Proposito |
| --- | --- |
| `notification_types` | Tipos disponibles |
| `notification_type_role` | Roles habilitados por tipo |
| `user_notif_prefs` | Preferencias por usuario |
| `notifications` | Notificaciones internas |
| `jobs` | Cola pendiente |
| `failed_jobs` | Cola fallida |

