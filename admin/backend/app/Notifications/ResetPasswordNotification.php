<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = url(config('app.frontend_url').'/reset-password?token='.$this->token.'&email='.$notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Restablecer contraseña - '.config('app.name'))
            ->greeting('¡Hola!')
            ->line('Estás recibiendo este correo porque recibimos una solicitud de restablecimiento de contraseña para tu cuenta.')
            ->action('Restablecer Contraseña', $url)
            ->line('Este enlace de restablecimiento de contraseña expirará en '.config('auth.passwords.'.config('auth.defaults.passwords').'.expire').' minutos.')
            ->line('Si no solicitaste un restablecimiento de contraseña, no es necesario realizar ninguna otra acción.')
            ->salutation('Saludos, '.config('app.name'))
            ->with([
                'subcopy' => 'Si tienes problemas para hacer clic en el botón "Restablecer Contraseña", copia y pega la siguiente URL en tu navegador: [' . $url . '](' . $url . ')'
            ]);
    }
}
