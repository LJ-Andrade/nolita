<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmación de Pedido</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">Confirmación de Pedido</h2>
    
    <p>Hola {{ $customer->name }},</p>
    
    <p>Tu pedido #{{ $order->id }} ha sido confirmado.</p>
    
    <h3 style="background-color: #f5f5f5; padding: 10px;">Detalles del Pedido</h3>
    
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="border-bottom: 1px solid #ddd;">
                <th style="text-align: left; padding: 8px;">Producto</th>
                <th style="text-align: center; padding: 8px;">Cant.</th>
                <th style="text-align: right; padding: 8px;">Precio</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px;">{{ $item->product_name }}</td>
                <td style="text-align: center; padding: 8px;">{{ $item->quantity }}</td>
                <td style="text-align: right; padding: 8px;">${{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <p style="font-size: 18px; font-weight: bold; text-align: right;">
        Total: {{ $order->currency }} ${{ number_format($order->total_amount, 2) }}
    </p>
    
    @if($order->shipping_address)
    <h3 style="background-color: #f5f5f5; padding: 10px;">Dirección de Envío</h3>
    <p>
        {{ $order->shipping_address['address'] ?? '' }}<br>
        {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['postal_code'] ?? '' }}<br>
        {{ $order->shipping_address['country'] ?? '' }}
    </p>
    @endif
    
    <p style="color: #666; font-size: 12px;">
        Gracias por tu compra.
    </p>
</body>
</html>