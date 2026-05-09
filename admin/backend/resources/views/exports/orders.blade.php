<!doctype html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Orders Export</title>
    <style>
        body {
            color: #111827;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.4;
        }

        h1 {
            font-size: 20px;
            margin: 0 0 4px;
        }

        .meta {
            color: #6b7280;
            margin-bottom: 18px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th,
        td {
            border: 1px solid #d1d5db;
            padding: 6px 7px;
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
    </style>
</head>
<body>
    <h1>Orders Export</h1>
    <div class="meta">
        Generated at {{ $generatedAt->format('Y-m-d H:i:s') }}
        @if($search)
            | Search: {{ $search }}
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Items</th>
                <th class="numeric">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($orders as $order)
                @php
                    $shippingAddress = is_array($order->shipping_address) ? $order->shipping_address : [];
                @endphp
                <tr>
                    <td>#{{ $order->id }}</td>
                    <td>{{ $order->created_at?->format('Y-m-d') }}</td>
                    <td>{{ $order->status }}</td>
                    <td>{{ $order->customer?->name ?? ($shippingAddress['name'] ?? '') }}</td>
                    <td>{{ $order->customer?->email ?? ($shippingAddress['email'] ?? '') }}</td>
                    <td class="numeric">{{ $order->items_count }}</td>
                    <td class="numeric">{{ number_format((float) $order->total_amount, 2) }} {{ $order->currency }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">No orders found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
