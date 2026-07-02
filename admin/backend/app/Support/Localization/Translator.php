<?php

declare(strict_types=1);

namespace App\Support\Localization;

final class Translator
{
    private const LABELS = [
        'address' => 'Dirección',
        'billing' => 'Facturación',
        'billing_contact' => 'Contacto de facturación',
        'coupon' => 'Cupón',
        'delivery_fee' => 'Costo de envío',
        'delivery_method' => 'Método de entrega',
        'dni' => 'DNI',
        'dni_cuit' => 'DNI / CUIT',
        'email' => 'Email',
        'items' => 'Artículos',
        'locality' => 'Localidad',
        'name' => 'Nombre',
        'no_items_found' => 'No se encontraron artículos.',
        'order' => 'Pedido',
        'order_type' => 'Tipo de pedido',
        'payment_fee' => 'Ajuste por pago',
        'payment_method' => 'Método de pago',
        'phone' => 'Teléfono',
        'postal_code' => 'Código postal',
        'product' => 'Producto',
        'province' => 'Provincia',
        'quantity' => 'Cantidad',
        'total_quantity' => 'Cantidad total de prendas',
        'shipping_address' => 'Dirección de envío',
        'shipping_and_billing' => 'Envío y facturación',
        'shipping_contact' => 'Contacto de envío',
        'shipping_name' => 'Nombre de envío',
        'status' => 'Estado',
        'subtotal' => 'Subtotal',
        'total' => 'Total',
        'variant' => 'Variante',
    ];

    private const ORDER_STATUSES = [
        'pending' => 'Pendiente',
        'processing' => 'Procesando',
        'completed' => 'Completado',
        'cancelled' => 'Cancelado',
    ];

    private const PAYMENT_METHODS = [
        'cash' => 'Efectivo',
        'transfer' => 'Transferencia',
        'credit_card' => 'Tarjeta de crédito',
        'debit_card' => 'Tarjeta de débito',
        'mercadopago' => 'Mercado Pago',
    ];

    public static function label(string $key): string
    {
        return self::LABELS[$key] ?? self::humanize($key);
    }

    public static function orderStatus(?string $status): string
    {
        if ($status === null || $status === '') {
            return '-';
        }

        return self::ORDER_STATUSES[$status] ?? self::humanize($status);
    }

    public static function paymentMethod(?string $method): string
    {
        if ($method === null || $method === '') {
            return '-';
        }

        return self::PAYMENT_METHODS[$method] ?? self::humanize($method);
    }

    public static function word(?string $value): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        return self::LABELS[$value] ?? self::humanize($value);
    }

    private static function humanize(string $value): string
    {
        return ucfirst(str_replace('_', ' ', $value));
    }
}
