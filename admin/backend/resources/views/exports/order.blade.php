<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Pedido #{{ $order['id'] }}</title>
    <style>
        body {
            background: #ffffff;
            color: #111827;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.45;
        }

        h1,
        h2,
        h3,
        p {
            margin: 0;
        }

        .document-header {
            border-bottom: 3px solid #111827;
            margin-bottom: 18px;
            padding-bottom: 14px;
        }

        .document-title {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0;
        }

        .document-meta {
            color: #4b5563;
            font-size: 11px;
            margin-top: 4px;
        }

        .summary-grid {
            margin-bottom: 14px;
            width: 100%;
        }

        .summary-grid td {
            border: 1px solid #d1d5db;
            padding: 8px;
            vertical-align: top;
            width: 33.333%;
        }

        .summary-label {
            color: #6b7280;
            display: block;
            font-size: 9px;
            font-weight: 700;
            margin-bottom: 2px;
            text-transform: uppercase;
        }

        .summary-value {
            color: #111827;
            font-size: 13px;
            font-weight: 700;
        }

        .section {
            margin-top: 16px;
        }

        .section-title {
            background: #111827;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            padding: 7px 9px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th,
        td {
            border: 1px solid #d1d5db;
            padding: 7px 8px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background: #f3f4f6;
            font-weight: 700;
        }

        .numeric {
            text-align: right;
        }

        .muted {
            color: #6b7280;
        }

        .totals {
            margin-left: auto;
            margin-top: 14px;
            width: 45%;
        }

        .totals td {
            padding: 7px 8px;
        }

        .total-row td {
            background: #111827;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
        }
    </style>
</head>
<body>
    @php
        use App\Support\Localization\Translator;

        $label = static fn ($key) => Translator::label($key);
        $money = static fn ($value) => '$ ' . number_format((float) $value, 2, ',', '.');
        $plain = static fn ($value) => filled($value) ? $value : '-';
    @endphp

    <div class="document-header">
        <h1 class="document-title">{{ $label('order') }} #{{ $order['id'] }}</h1>
        <p class="document-meta">
            {{ $label('generated_at') }} {{ $generated_at->format('d/m/Y H:i:s') }}
        </p>
    </div>

    <table class="summary-grid">
        <tr>
            <td>
                <span class="summary-label">{{ $label('order_type') }}</span>
                <span class="summary-value">{{ $plain($order['order_type_label']) }}</span>
            </td>
            <td>
                <span class="summary-label">{{ $label('created_at') }}</span>
                <span class="summary-value">{{ $order['created_at']?->format('d/m/Y H:i') ?? '-' }}</span>
            </td>
            <td>
                <span class="summary-label">{{ $label('total') }}</span>
                <span class="summary-value">{{ $money($totals['total']) }} {{ $plain($order['currency']) }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="summary-label">{{ $label('payment_method') }}</span>
                <span class="summary-value">{{ $plain($order['payment_method_label']) }}</span>
            </td>
            <td>
                <span class="summary-label">{{ $label('delivery_method') }}</span>
                <span class="summary-value">{{ $plain($order['delivery_method']) }}</span>
            </td>
            <td>
                <span class="summary-label">{{ $label('coupon') }}</span>
                <span class="summary-value">{{ $plain($order['coupon_code']) }}</span>
            </td>
        </tr>
    </table>

    <div class="section">
        <div class="section-title">{{ $label('customer_header') }}</div>
        <table>
            <tr>
                <th>{{ $label('customer_id') }}</th>
                <th>{{ $label('name') }}</th>
                <th>{{ $label('dni_cuit') }}</th>
                <th>{{ $label('email') }}</th>
            </tr>
            <tr>
                <td>{{ $plain($customer['id']) }}</td>
                <td>{{ $plain($customer['name']) }}</td>
                <td>{{ $plain($customer['dni_or_cuit']) }}</td>
                <td>{{ $plain($customer['email']) }}</td>
            </tr>
            <tr>
                <th>{{ $label('phone') }}</th>
                <th>{{ $label('address') }}</th>
                <th>{{ $label('locality') }}</th>
                <th>{{ $label('province_postal_code') }}</th>
            </tr>
            <tr>
                <td>{{ $plain($customer['phone']) }}</td>
                <td>{{ $plain($customer['address']) }}</td>
                <td>{{ $plain($customer['locality']) }}</td>
                <td>{{ $plain($customer['province']) }} / {{ $plain($customer['postal_code']) }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">{{ $label('items') }}</div>
        <table>
            <thead>
                <tr>
                    <th>{{ $label('product') }}</th>
                    <th>{{ $label('color') }}</th>
                    <th>{{ $label('size') }}</th>
                    <th class="numeric">{{ $label('quantity') }}</th>
                    <th class="numeric">{{ $label('unit_price') }}</th>
                    <th class="numeric">{{ $label('subtotal') }}</th>
                </tr>
            </thead>
            <tbody>
                @forelse($items as $item)
                    <tr>
                        <td>
                            {{ $plain($item['product_name']) }}<br>
                            <span class="muted">{{ $label('product') }} #{{ $plain($item['product_id']) }}</span>
                        </td>
                        <td>{{ $plain($item['color']) }}</td>
                        <td>{{ $plain($item['size']) }}</td>
                        <td class="numeric">{{ $item['quantity'] }}</td>
                        <td class="numeric">{{ $money($item['unit_price']) }}</td>
                        <td class="numeric">{{ $money($item['subtotal']) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6">{{ $label('no_items_found') }}</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <table class="totals">
        <tr>
            <td>{{ $label('subtotal') }}</td>
            <td class="numeric">{{ $money($totals['subtotal']) }}</td>
        </tr>
        <tr>
            <td>{{ $label('discount') }}</td>
            <td class="numeric">- {{ $money($totals['discount']) }}</td>
        </tr>
        <tr>
            <td>{{ $label('delivery_fee') }}</td>
            <td class="numeric">{{ $money($totals['delivery_fee']) }}</td>
        </tr>
        <tr>
            <td>{{ $label('payment_fee') }}</td>
            <td class="numeric">{{ $money($totals['payment_fee']) }}</td>
        </tr>
        <tr class="total-row">
            <td>{{ $label('total') }}</td>
            <td class="numeric">{{ $money($totals['total']) }}</td>
        </tr>
    </table>

    @if($order['notes'])
        <div class="section">
            <div class="section-title">{{ $label('notes') }}</div>
            <table>
                <tr>
                    <td>{{ $order['notes'] }}</td>
                </tr>
            </table>
        </div>
    @endif
</body>
</html>
