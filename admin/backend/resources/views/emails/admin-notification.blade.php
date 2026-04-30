<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Notificación</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">{{ $notification['title'] }}</h2>
    
    <p><strong>Tipo:</strong> {{ $notification['type'] }}</p>
    <p><strong>Usuario:</strong> {{ $notification['user_name'] }}</p>
    
    @if($notification['message'])
    <p>{{ $notification['message'] }}</p>
    @endif
    
    @if($notification['data'])
    <h3>Detalles:</h3>
    <ul>
        @foreach($notification['data'] as $key => $value)
        <li><strong>{{ $key }}:</strong> {{ is_array($value) ? json_encode($value) : $value }}</li>
        @endforeach
    </ul>
    @endif
    
    <p style="color: #666; font-size: 12px;">
        Studio Vimana - Sistema de Notificaciones
    </p>
</body>
</html>