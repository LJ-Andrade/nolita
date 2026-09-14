@extends('emails.customer.layout')

@section('title', 'Gracias por comprar en Nolita')
@section('preheader', 'Recibimos tu pedido #'.($data['order_number'] ?? '').'. Acá tenés el detalle de tu compra.')

@section('content')
    @php
        $firstName = trim((string) ($data['first_name'] ?? ''));
        $currency = trim((string) ($data['currency'] ?? 'ARS'));
        $money = static fn ($amount): string => ($currency === 'ARS' ? '$' : $currency).' '.number_format((float) $amount, 2, ',', '.');
        $items = is_array($data['items'] ?? null) ? $data['items'] : [];
        $delivery = is_array($data['delivery'] ?? null) ? $data['delivery'] : [];
        $payment = is_array($data['payment'] ?? null) ? $data['payment'] : [];
        $locality = trim(implode(', ', array_filter([$delivery['locality'] ?? null, $delivery['province'] ?? null])));
        $labelStyle = 'padding: 5px 0; color: #6F6052; font-size: 14px;';
        $valueStyle = 'padding: 5px 0; color: #2F2922; font-size: 14px;';
        $sectionTitleStyle = 'margin: 0 0 12px; color: #000000; font-size: 13px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase;';
    @endphp

    <h1 style="margin: 0 0 20px; color: #000000; font-size: 28px; font-weight: 500; line-height: 1.25;">Gracias por comprar en Nolita</h1>
    <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.7;">{{ $firstName !== '' ? "Hola {$firstName}," : 'Hola,' }}</p>
    <p style="margin: 0 0 8px; color: #6F6052; font-size: 15px; line-height: 1.7;">Recibimos tu pedido correctamente. Te dejamos el detalle de tu compra.</p>
    <p style="margin: 0 0 28px; color: #6F6052; font-size: 13px; line-height: 1.6;">Pedido <strong style="color: #2F2922;">#{{ $data['order_number'] ?? '' }}</strong>@if (! empty($data['created_at'])) · {{ $data['created_at'] }}@endif</p>

    <p style="{{ $sectionTitleStyle }}">Detalle de la compra</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0 0 20px; border: 1px solid #E5DFD3; border-collapse: collapse;">
        <tr style="background-color: #FBF7F4;">
            <td align="left" style="padding: 10px 12px; color: #6F6052; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Producto</td>
            <td align="center" style="padding: 10px 8px; color: #6F6052; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Cant.</td>
            <td align="right" style="padding: 10px 8px; color: #6F6052; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Precio</td>
            <td align="right" style="padding: 10px 12px; color: #6F6052; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Subtotal</td>
        </tr>
        @forelse ($items as $item)
            <tr>
                <td style="padding: 12px; border-top: 1px solid #E5DFD3; color: #2F2922; font-size: 14px; line-height: 1.45;">
                    <strong>{{ $item['name'] ?? 'Producto' }}</strong>
                    @if (! empty($item['variant']))
                        <br><span style="color: #6F6052; font-size: 12px;">{{ $item['variant'] }}</span>
                    @endif
                </td>
                <td align="center" style="padding: 12px 8px; border-top: 1px solid #E5DFD3; color: #2F2922; font-size: 14px;">{{ $item['quantity'] ?? 0 }}</td>
                <td align="right" style="padding: 12px 8px; border-top: 1px solid #E5DFD3; color: #2F2922; font-size: 14px; white-space: nowrap;">{{ $money($item['unit_price'] ?? 0) }}</td>
                <td align="right" style="padding: 12px; border-top: 1px solid #E5DFD3; color: #2F2922; font-size: 14px; font-weight: bold; white-space: nowrap;">{{ $money($item['subtotal'] ?? 0) }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="4" style="padding: 14px 12px; border-top: 1px solid #E5DFD3; color: #6F6052; font-size: 14px;">No hay productos para mostrar.</td>
            </tr>
        @endforelse
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0 0 32px;">
        <tr>
            <td style="{{ $labelStyle }}">Subtotal</td>
            <td align="right" style="{{ $valueStyle }}">{{ $money($data['subtotal'] ?? 0) }}</td>
        </tr>
        @if ((float) ($data['coupon_discount'] ?? 0) > 0)
            <tr>
                <td style="{{ $labelStyle }}">Descuento @if (! empty($data['coupon_code']))({{ $data['coupon_code'] }})@endif</td>
                <td align="right" style="{{ $valueStyle }}">- {{ $money($data['coupon_discount']) }}</td>
            </tr>
        @endif
        <tr>
            <td style="{{ $labelStyle }}">Envío</td>
            <td align="right" style="{{ $valueStyle }}">{{ (float) ($data['delivery_fee'] ?? 0) > 0 ? $money($data['delivery_fee']) : 'Sin cargo' }}</td>
        </tr>
        @if ((float) ($data['payment_fee'] ?? 0) != 0)
            <tr>
                <td style="{{ $labelStyle }}">Ajuste por medio de pago</td>
                <td align="right" style="{{ $valueStyle }}">{{ $money($data['payment_fee']) }}</td>
            </tr>
        @endif
        <tr>
            <td style="padding: 14px 0 0; border-top: 1px solid #E5DFD3; color: #000000; font-size: 17px; font-weight: bold;">Total</td>
            <td align="right" style="padding: 14px 0 0; border-top: 1px solid #E5DFD3; color: #000000; font-size: 19px; font-weight: bold; white-space: nowrap;">{{ $money($data['total'] ?? 0) }}</td>
        </tr>
    </table>

    <p style="{{ $sectionTitleStyle }}">Medio de pago</p>
    <div style="margin: 0 0 32px; padding: 16px; border-left: 3px solid #2F2922; background-color: #FBF7F4; color: #2F2922; font-size: 14px; line-height: 1.6;">
        <p style="margin: 0 0 6px; font-size: 15px; font-weight: bold;">{{ $payment['method'] ?? 'A coordinar' }}</p>
        @if (! empty($payment['description_html']))
            <div style="color: #2F2922; font-size: 14px; line-height: 1.6;">{!! $payment['description_html'] !!}</div>
        @endif
    </div>

    <p style="{{ $sectionTitleStyle }}">Entrega</p>
    <p style="margin: 0; color: #2F2922; font-size: 14px; line-height: 1.7;">
        @if (! empty($delivery['method']))<strong>{{ $delivery['method'] }}</strong><br>@endif
        @if (! empty($delivery['name'])){{ $delivery['name'] }}<br>@endif
        @if (! empty($delivery['address'])){{ $delivery['address'] }}<br>@endif
        @if ($locality !== ''){{ $locality }}<br>@endif
        @if (! empty($delivery['postal_code']))CP {{ $delivery['postal_code'] }}<br>@endif
        @if (! empty($delivery['phone']))Tel. {{ $delivery['phone'] }}@endif
    </p>
@endsection
