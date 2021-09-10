@extends('vadmin.partials.invoice-excel')

@section('content')

    <table>
    <tr>
        <th>Código</th>
        <th>Artículo</th>
        <th>Marca</th>
        <th>Talle - Color - Tela</th>
        <th>P.U.</th>
        <th>Cantidad</th>
        <th></th>
        <th>Total</th>
    </tr>
    @foreach($order['rawdata']->items as $item)
    <tr>
        <td>{{ $item->article->code }}</td>
        <td>{{ $item->article->name }}</td>
        {{-- <td>{{ $item->article->brand->name }}</td> --}}
        <td>{{ $item->size }} | {{ $item->color }} | {{ $item->textile }}</td>
        <td>$ {{ $item->final_price }}</td>
        <td>{{ $item->quantity }}</td>
        <td></td>
        <td >$ {{ number_format($item->quantity * $item->final_price,2) }}</td>
    </tr>
    @endforeach
    <tr style="border-top: 10px solid #f9f9f9">
        <td></td><td></td><td></td><td></td>
        <td></td>
        <td><b>SUBTOTAL</b></td>
        <td><b>$ {{ $order['subTotal'] }}</b></td>
    </tr>
    @if($order['orderDiscount'] != '0')
    <tr>
        <td></td><td></td><td></td><td></td>
        <td></td>
        <td><b>Descuento: </b> <span class="dont-break">% {{ $order['orderDiscount'] }}</span></td>
        <td>$ - {{ $order['discountValue'] }}</td>
    </tr>
    @endif
    <tr>
        <td></td><td></td><td></td><td></td>
        @if($order['rawdata']->shipping_id != null)
        <td></td>
        <td><b>Envío:</b> {{ $order['rawdata']->shipping->name }}</td>
        <td>$ {{ $order['shippingCost'] }}</td>
        @else
        <td></td>
        <td>Envío no seleccionado</td>
        <td>-</td>
        @endif
    </tr>
    <tr>
        <td></td><td></td><td></td><td></td>
        @if($order['rawdata']->payment_method_id != null)
        <td></td>
        <td><b>Forma de pago:</b> {{ $order['rawdata']->payment->name }} (% {{ $order['paymentPercent'] }})</td>
        <td>${{ $order['paymentCost'] }}</td>
        @else
        <td></td>
        <td>Forma de pago no seleccionado</td>
        <td>-</td>
        @endif
    </tr>
    <tr>
        <td></td><td></td><td></td><td></td>
        <td></td>
        <td><b>TOTAL</b></td>
        <td><b>$ {{ $order['total'] }}</b></td>
    </tr>                                
</table>
@endsection