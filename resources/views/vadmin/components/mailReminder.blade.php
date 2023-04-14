@component('mail::layout')
    {{-- Header --}}
    @slot('header')
        @component('mail::header', ['url' => config('app.url')])
            {{ APP_BUSSINESS_NAME }}
        @endcomponent
    @endslot

    ###<center>Tu carro de compras está activo, te recordamos que aún estás a tiempo de terminar tu compra.</center>
    ##<center>En 24hs el carro se cerrará automáticamente.</center>


    @slot('subcopy')
        @component('mail::subcopy')
            <!-- subcopy here -->
        @endcomponent
    @endslot

    {{-- Footer --}}
    @slot('footer')
        @component('mail::footer')
        Mensaje enviado desde <b>Vadmin</b> | Desarrollado por <a href="https://vimanastudio.com.ar">Vimana Studio</a>
        @endcomponent
    @endslot
@endcomponent
