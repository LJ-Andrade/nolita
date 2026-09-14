<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <title>@yield('title')</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF7F4; color: #2F2922; font-family: 'Be Vietnam Pro', Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; mso-hide: all;">
        @yield('preheader')
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background-color: #FBF7F4;">
        <tr>
            <td align="center" style="padding: 24px 12px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 640px; border: 1px solid #E5DFD3; background-color: #FFFFFF;">
                    <tr>
                        <td align="center" style="padding: 32px 28px 28px; border-bottom: 1px solid #E5DFD3;">
                            <a href="{{ $data['storefront_url'] ?? '#' }}" style="display: inline-block; color: #000000; text-decoration: none;">
                                @if (! empty($data['logo_url']))
                                    <img src="{{ $data['logo_url'] }}" width="180" alt="{{ $data['brand_name'] ?? 'Nolita' }}" style="display: block; width: 180px; max-width: 100%; height: auto; border: 0; color: #000000; font-size: 26px; letter-spacing: 0.2em;">
                                @else
                                    <span style="font-size: 26px; letter-spacing: 0.2em;">{{ strtoupper($data['brand_name'] ?? 'Nolita') }}</span>
                                @endif
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 36px 28px;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 28px; border-top: 1px solid #E5DFD3; background-color: #FBF7F4; color: #6F6052; font-size: 12px; line-height: 1.6; text-align: center;">
                            @if (! empty($data['support_email']) || ! empty($data['whatsapp_url']))
                                <p style="margin: 0 0 8px;">
                                    ¿Tenés alguna consulta?
                                    @if (! empty($data['whatsapp_url']))
                                        <a href="{{ $data['whatsapp_url'] }}" style="color: #2F2922; font-weight: bold; text-decoration: underline;">Escribinos por WhatsApp</a>
                                    @endif
                                    @if (! empty($data['support_email']) && ! empty($data['whatsapp_url']))
                                        o a
                                    @endif
                                    @if (! empty($data['support_email']))
                                        <a href="mailto:{{ $data['support_email'] }}" style="color: #2F2922; font-weight: bold; text-decoration: underline;">{{ $data['support_email'] }}</a>
                                    @endif
                                </p>
                            @endif
                            <p style="margin: 0;">Este es un mensaje automático de {{ $data['brand_name'] ?? 'Nolita' }}. Por favor, no respondas a este correo.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
