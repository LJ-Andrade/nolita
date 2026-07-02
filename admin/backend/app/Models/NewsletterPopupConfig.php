<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterPopupConfig extends Model
{
    protected $table = 'newsletter_popup_config';

    protected $fillable = [
        'is_enabled',
        'delay_seconds',
        'title',
        'subtitle',
        'name_label',
        'name_placeholder',
        'email_label',
        'email_placeholder',
        'customer_type_text',
        'submit_text',
        'dismiss_text',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'delay_seconds' => 'integer',
    ];

    public static function getConfig(): self
    {
        return static::firstOrCreate([], [
            'is_enabled' => true,
            'delay_seconds' => 3,
            'title' => '¡No te pierdas nuestras novedades!',
            'subtitle' => 'Dejanos tu nombre y tu email para recibir antes que nadie nuevos ingresos, lanzamientos, promociones y novedades exclusivas.',
            'name_label' => 'Nombre y Apellido',
            'name_placeholder' => 'Ingresa tu nombre',
            'email_label' => 'Correo Electrónico',
            'email_placeholder' => 'Ingresa tu correo',
            'customer_type_text' => 'Además, contanos si comprás como Mayorista o Minorista para enviarte información y beneficios pensados para vos.',
            'submit_text' => 'QUIERO RECIBIR NOVEDADES',
            'dismiss_text' => 'No mostrar más',
        ]);
    }
}
