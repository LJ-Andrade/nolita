@extends('vadmin.partials.invoice-excel')

@section('content')
<table class="table">
    <thead>
        <tr>
            <th>Nombre (Usuario)</th>
            <th>E-Mail</th>
			<th>Fecha de Registro</th>
			<th>Cantidad de compras</th>
			<th>Total gastado</th>
			<th>Última fecha de compra</th>
            <th>Estado </th>
        </tr>
    </thead>
    <tbody>
    @foreach($items as $item)
    
        <tr>
            <td>{{ $item->name }} {{ $item->surname }} ({{ $item->username }})</td>
            <td>{{ $item->email }}</td>
            <td>{{ transDateT($item->created_at) }}</td>
			<td>{{ $item->totalCarts() }}</td>
			<td>$ {{ $item->totalSpent() }}</td>
			<td>{{ $item->lastOrderDate() }}</td>
            <td>{{ $item->status }} </td>
        </tr>
    @endforeach			
    </tbody>
</table>
@endsection