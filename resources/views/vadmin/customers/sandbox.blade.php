@extends('vadmin.partials.main')
{{-- PAGE TITLE --}}
@section('title', 'Vadmin | Clientes')

{{-- CONTENT --}}
@section('header')
	@component('vadmin.components.header-list')
		@slot('breadcrums')
		    <li class="breadcrumb-item"><a href="{{ url('vadmin')}}">Inicio</a></li>
            <li class="breadcrumb-item active">Listado de Clientes</li>
		@endslot
		@slot('actions')
			{{-- Actions --}}
			<div class="list-actions">
				<a href="{{ route('customers.create') }}" class="btn btnMain"><i class="icon-plus-round"></i>  Nuevo Cliente</a>
				<button id="SearchFiltersBtn" class="btn btnMain"><i class="icon-ios-search-strong"></i></button>
				@if(Auth::guard('user')->user()->role <= 2)
				{{-- Edit --}}
				<button class="EditBtn btn btnGreen Hidden"><i class="icon-pencil2"></i> Editar</button>
				<input id="EditId" type="hidden">
				{{-- Delete --}}
				{{--  THIS VALUE MUST BE THE NAME OF THE SECTION CONTROLLER  --}}
				<input id="ModelName" type="hidden" value="customers">
				<button class="DeleteBtn btn btnRed Hidden"><i class="icon-bin2"></i> Eliminar</button>
				<input id="RowsToDeletion" type="hidden" name="rowstodeletion[]" value="">
				@endif

			</div>
		@endslot
		@slot('searcher')
			@include('vadmin.customers.searcher')
		@endslot
	@endcomponent
@endsection

@section('content')

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
        </tr>
    @endforeach			
    </tbody>
</table>
@endsection

    <div id="Error"></div>	
@endsection

{{-- SCRIPT INCLUDES --}}
@section('scripts')
	@include('vadmin.components.bladejs')
	<script>
		allowEnterOnForms = true;
	</script>
@endsection

