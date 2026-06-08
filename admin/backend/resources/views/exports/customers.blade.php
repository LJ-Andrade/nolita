<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $title }}</title>
    <style>
        body {
            color: #111827;
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            line-height: 1.35;
        }

        h1 {
            font-size: 20px;
            margin: 0 0 4px;
        }

        .meta {
            color: #6b7280;
            margin-bottom: 16px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th,
        td {
            border: 1px solid #d1d5db;
            padding: 5px 6px;
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
    <h1>{{ $title }}</h1>
    <div class="meta">
        Generado: {{ $generatedAt->format('Y-m-d H:i:s') }}
        @if(!empty($filters['search']))
            | Busqueda: {{ $filters['search'] }}
        @endif
        @if(!empty($filters['price_mode']))
            | Modo: {{ $filters['price_mode'] === 'wholesale' ? 'Mayorista' : 'Minorista' }}
        @endif
    </div>

    @if($type === 'guest')
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Telefono</th>
                    <th>Modo</th>
                    <th class="numeric">Pedidos</th>
                    <th class="numeric">Total</th>
                    <th>Ultimo pedido</th>
                </tr>
            </thead>
            <tbody>
                @forelse($customers as $customer)
                    <tr>
                        <td>{{ $customer->name ?: 'Sin nombre' }}</td>
                        <td>{{ $customer->email }}</td>
                        <td>{{ $customer->phone ?: $customer->whatsapp }}</td>
                        <td>
                            @if($customer->bought_wholesale) Mayorista @endif
                            @if($customer->bought_retail) Minorista @endif
                        </td>
                        <td class="numeric">{{ (int) $customer->orders_count }}</td>
                        <td class="numeric">{{ number_format((float) $customer->total_spent, 2) }}</td>
                        <td>{{ $customer->last_order_at?->format('Y-m-d') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7">No se encontraron clientes.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @else
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Email</th>
                    <th>Telefono</th>
                    <th>Direccion</th>
                    <th>Estado</th>
                    <th>Alta</th>
                </tr>
            </thead>
            <tbody>
                @forelse($customers as $customer)
                    <tr>
                        <td>{{ $customer->name }}</td>
                        <td>{{ $customer->dni }}</td>
                        <td>{{ $customer->email }}</td>
                        <td>{{ $customer->phone }}</td>
                        <td>{{ $customer->address }}</td>
                        <td>{{ $customer->is_active ? 'Activo' : 'Inactivo' }}</td>
                        <td>{{ $customer->created_at?->format('Y-m-d') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7">No se encontraron clientes.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif
</body>
</html>
