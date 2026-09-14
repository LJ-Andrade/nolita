@php
    $firstName = trim((string) ($data['first_name'] ?? ''));
    $currency = trim((string) ($data['currency'] ?? 'ARS'));
    $money = static fn ($amount): string => ($currency === 'ARS' ? '$' : $currency).' '.number_format((float) $amount, 2, ',', '.');
    $items = is_array($data['items'] ?? null) ? $data['items'] : [];
    $delivery = is_array($data['delivery'] ?? null) ? $data['delivery'] : [];
    $payment = is_array($data['payment'] ?? null) ? $data['payment'] : [];
    $locality = trim(implode(', ', array_filter([$delivery['locality'] ?? null, $delivery['province'] ?? null])));
@endphp
GRACIAS POR COMPRAR EN NOLITA

{{ $firstName !== '' ? "Hola {$firstName}," : 'Hola,' }}

Recibimos tu pedido correctamente. Te dejamos el detalle de tu compra.

Pedido #{{ $data['order_number'] ?? '' }}@if (! empty($data['created_at'])) · {{ $data['created_at'] }}@endif


DETALLE DE LA COMPRA
@forelse ($items as $item)
- {{ $item['name'] ?? 'Producto' }}@if (! empty($item['variant'])) ({{ $item['variant'] }})@endif: {{ $item['quantity'] ?? 0 }} x {{ $money($item['unit_price'] ?? 0) }} = {{ $money($item['subtotal'] ?? 0) }}
@empty
- No hay productos para mostrar.
@endforelse

Subtotal: {{ $money($data['subtotal'] ?? 0) }}
@if ((float) ($data['coupon_discount'] ?? 0) > 0)
Descuento @if (! empty($data['coupon_code']))({{ $data['coupon_code'] }})@endif: - {{ $money($data['coupon_discount']) }}
@endif
Envío: {{ (float) ($data['delivery_fee'] ?? 0) > 0 ? $money($data['delivery_fee']) : 'Sin cargo' }}
@if ((float) ($data['payment_fee'] ?? 0) != 0)
Ajuste por medio de pago: {{ $money($data['payment_fee']) }}
@endif
Total: {{ $money($data['total'] ?? 0) }}


MEDIO DE PAGO
{{ $payment['method'] ?? 'A coordinar' }}
@if (! empty($payment['description_text']))
{{ $payment['description_text'] }}
@endif


ENTREGA
@if (! empty($delivery['method'])){{ $delivery['method'] }}
@endif
@if (! empty($delivery['name'])){{ $delivery['name'] }}
@endif
@if (! empty($delivery['address'])){{ $delivery['address'] }}
@endif
@if ($locality !== ''){{ $locality }}
@endif
@if (! empty($delivery['postal_code']))CP {{ $delivery['postal_code'] }}
@endif
@if (! empty($delivery['phone']))Tel. {{ $delivery['phone'] }}
@endif

@if (! empty($data['whatsapp_url']))
¿Tenés alguna consulta? Escribinos por WhatsApp: {{ $data['whatsapp_url'] }}
@endif
@if (! empty($data['support_email']))
Email: {{ $data['support_email'] }}
@endif

Este es un mensaje automático de {{ $data['brand_name'] ?? 'Nolita' }}. Por favor, no respondas a este correo.
{{ $data['storefront_url'] ?? '' }}
