@extends('store.partials.invoice')

@section('title', 'Comprobante | Pedido N°'.$order->id)

@section('content')
    <div class="invoice-ticket">
        <div class="header">
            <b>Comprobante de compra</b>  | Pedido N° <b>{{ $order->id }}</b>
            <div class="right">{{ transDateT($order->created_at) }}</div>
        </div>
        <div class="content">
                <div class="top-text">
                    <b>Nombre y Apellido:</b> {{ $order->customer->name }} {{ $order->customer->surname }} | <b>Usuario:</b> {{ $order->customer->username }} 
                    | {{ $order->customer->business_type }}<br>
                    @if($order->customer->cuit != null)
                    <b>Cuit:</b> {{ $order->customer->cuit }} <br>
                    @endif
                    @if($order->customer->dni != null)
                    <b>Dni:</b> {{ $order->customer->dni }} <br>
                    @endif
                    <b>Dirección: </b> {{ $order->customer->address }} | 
                    @if($order->customer->geoprov)
                        {{ $order->customer->geoprov->name }} | 
                    @endif
                    @if($order->customer->geoloc)
                        {{ $order->customer->geoloc->name }} <br>
                    @endif
                    <b>Teléfonos: </b> {{ $order->customer->phone }} @if($order->customer->phone2) | {{ $order->customer->phone2 }} @endif<br>
                    <b>E-mail: </b> {{ $order->customer->email }} <br>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Cant.</th>
                            <th>Artículo</th>
                            <th>Talle | Color | Tela</th>
                            <th>P.U</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $itemSum = 0 @endphp
                        @foreach($order->items->sortBy('article_name') as $item)
                        @php $itemSum += $item->quantity; @endphp
                        <tr class="content">
                            {{-- <td>#{{ $item->article->code }}</td> --}}
                            <td>x {{ $item->quantity }}</td>
                            <td>{{ $item->article->name }} (#{{ $item->article->code }})</td>
                            <td>
                                {{ $item->size }} @if($item->size != '') | @endif
                                {{ $item->color }} @if($item->color != '') | @endif
                                {{ $item->textile }} @if($item->textile != '') @endif
                            </td>
                            <td>$ {{ $item->final_price }}</td>
                            <td>$ {{ number_format($item->final_price * $item->quantity, 2) }}</td>
                        </tr>
                        @endforeach
                        <tr class="bottom-data">
                            <td>x {{ $itemSum }} Artículos</td>
                            <td></td><td></td>
                            <td>Subtotal</td>
                            <td>$ {{ $cart['subTotal'] }}</td>
                        </tr>
                        @if($cart['orderDiscount'] > 0)
                        <tr>
                            <td></td><td></td><td></td>
                            <td>Descuento <span class="dont-break">(% {{$cart['orderDiscount']}})</span></td>
                            <td>$ - {{ $cart['discountValue'] }}</td>
                        </tr>
                        @endif
                        <tr>
                            <td></td><td></td>
                            <td>Método de envío</td>
                            @if($cart['rawdata']->shipping))
                                <td>{{ $cart['rawdata']->shipping->name }}</td>
                                <td>$ {{ $cart['shippingCost'] }}</td>
                            @else
                                <td>No Seleccionado</td>
                                <td></td>
                            @endif
                        </tr>
                        <tr>
                            <td></td><td></td>
                            @if($cart['rawdata']->shipping))
                            <td>Forma de pago <span class="dont-break" style="white-space: nowrap">(% {{ $cart['paymentPercent'] }})</span></td>
                            <td>{{ $cart['rawdata']->payment->name }}</td>
                            <td>$ {{ calcPercent($cart['subTotal'], $cart['paymentPercent']) }}</td>
                            @else
                            <td>Forma de pago</td>
                            <td>No seleccionada</td><td></td>
                            @endif
                        </tr>
                        <tr>
                            <td></td><td></td><td></td>
                            <td>TOTAL</td>
                            <td>$ {{ $cart['total'] }}</td>
                        </tr>
                    </tbody>
                </table>
        </div>
    </div>
    <div class="footer">{{ APP_BUSSINESS_NAME }}</div>
@endsection
