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

        .first-page-panel {
            border: 1px solid #d1d5db;
            border-radius: 5px;
            padding: 14px;
        }

        .document-header {
            border-bottom: 3px solid #111827;
            margin-bottom: 18px;
            padding-bottom: 14px;
            position: relative;
        }

        .header-label {
            color: #6b7280;
            display: block;
            font-size: 9px;
            font-weight: 700;
            margin-bottom: 2px;
            text-transform: uppercase;
        }

        .header-value {
            color: #111827;
            font-size: 16px;
            font-weight: 700;
        }

        .order-date {
            color: #4b5563;
            font-size: 11px;
            font-weight: 400;
            position: absolute;
            right: 0;
            top: 0;
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

        .method-row {
            margin-top: 12px;
            width: 100%;
        }

        .methods-table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
        }

        .methods-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            vertical-align: top;
            width: 33.333%;
        }

        .method-fee {
            color: #4b5563;
            display: block;
            font-size: 10px;
            font-weight: 400;
            margin-top: 3px;
        }

        .info-panel {
            border-top: 1px solid #d1d5db;
            padding-top: 14px;
        }

        .info-columns {
            display: table;
            table-layout: fixed;
            width: 100%;
        }

        .info-column {
            display: table-cell;
            vertical-align: top;
            width: 50%;
        }

        .info-line {
            margin-bottom: 5px;
        }

        .info-label {
            color: #6b7280;
            font-weight: 700;
            margin-right: 3px;
        }

        .section-title {
            background: #e5e7eb;
            color: #111827;
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

        .items-table {
            font-size: 10px;
            line-height: 1.25;
            table-layout: fixed;
        }

        .items-table th,
        .items-table td {
            padding: 5px 6px;
            vertical-align: middle;
        }

        .product-column {
            width: 41%;
        }

        .variant-column {
            width: 25%;
        }

        .quantity-column {
            width: 10%;
        }

        .money-column {
            width: 12%;
        }

        .compact-cell {
            overflow-wrap: anywhere;
            white-space: nowrap;
        }

        .product-meta {
            display: inline;
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
            background: #e5e7eb;
            color: #111827;
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

    <div class="first-page-panel">
        <div class="document-header">
            <div class="order-date">{{ $order['created_at']?->format('d/m/Y H:i') ?? '-' }}</div>
            <span class="header-label">{{ $label('order') }}</span>
            <span class="header-value">#{{ $order['id'] }}</span>
        </div>

        <div class="method-row">
            <table class="methods-table">
                <tr>
                    <td>
                        <span class="summary-label">{{ $label('order_type') }}</span>
                        <span class="summary-value">{{ $plain($order['order_type_label']) }}</span>
                    </td>
                    <td>
                        <span class="summary-label">{{ $label('delivery_method') }}</span>
                        <span class="summary-value">{{ $plain($order['delivery_method']) }}</span>
                        @if($totals['delivery_fee'] > 0)
                            <span class="method-fee">{{ $label('delivery_fee') }}: {{ $money($totals['delivery_fee']) }}</span>
                        @endif
                    </td>
                    <td>
                        <span class="summary-label">{{ $label('payment_method') }}</span>
                        <span class="summary-value">{{ $plain($order['payment_method_label']) }}</span>
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="info-panel">
                <div class="info-columns">
                    <div class="info-column">
                        <div class="info-line"><span class="info-label">{{ $label('name') }}:</span> <strong>{{ $plain($customer['name']) }}</strong></div>
                        <div class="info-line"><span class="info-label">{{ $label('dni_cuit') }}:</span> {{ $plain($customer['dni_or_cuit']) }}</div>
                        <div class="info-line"><span class="info-label">{{ $label('email') }}:</span> {{ $plain($customer['email']) }}</div>
                        <div class="info-line"><span class="info-label">{{ $label('phone') }}:</span> {{ $plain($customer['phone']) }}</div>
                    </div>
                    <div class="info-column">
                        <div class="info-line"><span class="info-label">{{ $label('address') }}:</span> {{ $plain($customer['address']) }}</div>
                        <div class="info-line"><span class="info-label">{{ $label('province') }}:</span> {{ $plain($customer['province']) }}</div>
                        <div class="info-line"><span class="info-label">{{ $label('locality') }}:</span> {{ $plain($customer['locality']) }}</div>
                        <div class="info-line"><span class="info-label">{{ $label('postal_code') }}:</span> {{ $plain($customer['postal_code']) }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">{{ $label('items') }}</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th class="product-column">{{ $label('product') }}</th>
                    <th class="variant-column">{{ $label('variant') }}</th>
                    <th class="numeric quantity-column">{{ $label('quantity') }}</th>
                    <th class="numeric money-column">P.U.</th>
                    <th class="numeric money-column">{{ $label('subtotal') }}</th>
                </tr>
            </thead>
            <tbody>
                @forelse($items as $item)
                    <tr>
                        <td class="compact-cell">
                            {{ $plain($item['product_name']) }}
                            <span class="muted product-meta">({{ $plain($item['product_code']) }} / {{ $plain($item['sku']) }})</span>
                        </td>
                        <td class="compact-cell">{{ $plain($item['variant']) }}</td>
                        <td class="numeric">{{ $item['quantity'] }}</td>
                        <td class="numeric">{{ $money($item['unit_price']) }}</td>
                        <td class="numeric">{{ $money($item['subtotal']) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5">{{ $label('no_items_found') }}</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <table class="totals">
        <tr>
            <td>{{ $label('total_quantity') }}</td>
            <td class="numeric">{{ $totals['quantity'] }}</td>
        </tr>
        <tr>
            <td>{{ $label('subtotal') }}</td>
            <td class="numeric">{{ $money($totals['subtotal']) }}</td>
        </tr>
        <tr>
            <td>{{ $label('delivery_fee') }}</td>
            <td class="numeric">{{ $money($totals['delivery_fee']) }}</td>
        </tr>
        <tr>
            <td>{{ $label('payment_fee') }}</td>
            <td class="numeric">{{ $money($totals['payment_fee']) }}</td>
        </tr>
        @if($order['coupon_code'] || $totals['discount'] > 0)
            <tr>
                <td>{{ $label('coupon') }} {{ $plain($order['coupon_code']) }}</td>
                <td class="numeric">- {{ $money($totals['discount']) }}</td>
            </tr>
        @endif
        <tr class="total-row">
            <td>{{ $label('total') }}</td>
            <td class="numeric">{{ $money($totals['total']) }}</td>
        </tr>
    </table>
</body>
</html>
