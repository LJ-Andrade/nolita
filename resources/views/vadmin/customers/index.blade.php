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
	<div class="list-wrapper">
		<div class="row inline-links">
			<b>Órden:</b> 
			@if(app('request')->input('group') != [])
				<a href="{{ route('customers.index', ['orderBy' => 'name', 'order' => 'ASC', 'group' => app('request')->input('group')]) }}" >A-Z</a>
				<a href="{{ route('customers.index', ['orderBy' => 'name', 'order' => 'DESC', 'group' => app('request')->input('group')]) }}" >Z-A</a>
			@else
				<a href="{{ route('customers.index', ['orderBy' => 'name', 'order' => 'ASC']) }}" >A-Z</a>
				<a href="{{ route('customers.index', ['orderBy' => 'name', 'order' => 'DESC']) }}" >Z-A</a>
			@endif
			{{-- <a href="{{ route('customers.index', ['orderBy' => 'name', 'group' => '2']) }}" >Minorístas</a>
			<a href="{{ route('customers.index', ['orderBy' => 'name', 'group' => '3']) }}" >Mayorístas</a> --}}
			{{-- <a href="{{ route('customers.index', ['orderBy' => 'created_at', 'order' => 'DESC']) }}">Fecha de Registro</a> --}}
		</div>
		<div class="row">
			@component('vadmin.components.list')
				@slot('actions')
					
					<a class="icon-container blue" data-toggle="modal" data-target="#ExportCustomers" data-toggle="tooltip" title="Exportar para Gmail">
						<i class="fas fa-file-excel"></i>
					</a> 
					{{-- <a href="{{ route('vadmin.exportAllCustomersSheet', ['params' => 'all', 'format' => 'xlsx']) }}" data-toggle="tooltip" title="Exportar a XLS" class="icon-container green">
						<i class="fas fa-file-excel"></i>
					</a>
					<a href="{{ route('vadmin.exportCustomersListSheet', ['params' => 'all', 'format' => 'csv']) }}" data-toggle="tooltip" title="Exportar a .CSV" class="icon-container blue">
						<i class="fas fa-file-excel"></i>
					</a> --}}
					<a class="icon-container blue" data-toggle="modal" data-target="#ExportGmailModal" data-toggle="tooltip" title="Exportar para Gmail">
						<i class="fab fa-google"></i>
					</a> 
					<a class="icon-container blue" data-toggle="modal" data-target="#ExportCustomersOrdersModal" data-toggle="tooltip" title="Exportar Compras">
						<i class="fas fa-shopping-cart"></i>
					</a> 
					<a class="icon-container blue" data-toggle="modal" data-target="#ExportSleepCustomersModal" data-toggle="tooltip" title="Exportar clientes sin compras">
						<i class="fas fa-bed"></i>
					</a> 

					
					{{-- <a href="{{ route('vadmin.exportForGmail', ['params' => 'all', 'format' => 'csv']) }}" data-toggle="tooltip" title="Exportar para Gmail"  class="icon-container blue">
						<i class="fab fa-google"></i>
					</a> --}}
					{{-- <a href="{{ route('vadmin.exportCustomersListPdf', ['params' => 'all', 'action' => 'download']) }}" data-toggle="tooltip" title="Exportar a .PDF" class="icon-container black">
						<i class="fas fa-file-pdf"></i>
					</a>
					<a href="{{ route('vadmin.exportCustomersListPdf', ['params' => 'all', 'action' => 'stream']) }}" data-toggle="tooltip" title="Exportar a .PDF" class="icon-container black" target="_blank">
						<i class="fas fa-eye"></i>
					</a> --}}
				@endslot	
				@slot('title', 'Clientes')
				@slot('tableTitles')
					@if(!$items->isEmpty())
						@if(Auth::guard('user')->user()->role <= 2)
						<th class="w-50">
							<label class="custom-control custom-checkbox list-checkbox">
								<input type="checkbox" class="Select-All-To-Delete custom-control-input row-checkbox">
								<span class="custom-control-indicator"></span>
								<span class="custom-control-description"></span>
							</label>
						</th>
						@endif
						<th>Nombre (Usuario)</th>
						<th>Email</th>
						<th>Compras Cerradas</th>
						<th>Total</th>
						<th>Registro</th>
						{{-- <th style="min-width: 150px">Tipo</th> --}}
						{{-- <th>Estado</th> --}}
						<th>Activo</th>
					@else
						<th></th>
					@endif
				@endslot

				@slot('tableContent')
					@if(!$items->isEmpty())
						@foreach($items as $item)
							<tr>
								@if(Auth::guard('user')->user()->role <= 2)
								<td class="mw-50">
									<label class="custom-control custom-checkbox list-checkbox">
										<input type="checkbox" class="List-Checkbox custom-control-input row-checkbox" data-id="{{ $item->id }}">
										<span class="custom-control-indicator"></span>
										<span class="custom-control-description"></span>
									</label>
								</td>
								@endif
								<td class="show-link"><a href="{{ url('vadmin/customers/'.$item->id) }}"> {{ $item->name }} {{ $item->surname}} ({{ $item->username }})</a></td>
								<td>{{ $item->email }}</td>
								<td>{{ $item->staticstics('totalCarts') }} </td>
								<td>${{ $item->staticstics('totalSpent') }} </td>
								<td>{{ transDateT($item->created_at) }}</td>
								{{-- <td>
									{!! Form::select('group', [1 => 'Esperando aprobación', 3 => 'Aprobado'], $item->group, ['class' => 'form-control', 'onChange' => 'updateCustomerGroup(this, this.dataset.id)', 'data-id' => $item->id]) !!}
								</td> --}}
								{{-- {{ clientGroupTrd($item->group) }}</td> --}}
								<td class="w-50 pad0 centered">
									<label class="switch">
										<input class="UpdateStatus switch-checkbox" type="checkbox" 
										data-model="Customer" data-id="{{ $item->id }}"
										@if($item->status == '1') checked @endif>
										<span class="slider round"></span>
									</label>
								</td>
							</tr>						
						@endforeach
					@else
						<tr>
							<td>No se han encontrado resultados</td>
						</tr>
					@endif
				@endslot
			@endcomponent
			{{--  Pagination  --}}
			{{-- <div class="inline-links">
				<b>Resultados por página:</b>
				<a href="{{ route('customers.index', ['orden' => 'ASC', 'redirect' => 'stock', 'results' => '5']) }}">5</a>
				<a href="{{ route('customers.index', ['orden' => 'ASC', 'redirect' => 'stock', 'results' => '50']) }}">50</a>
				<a href="{{ route('customers.index', ['orden' => 'ASC', 'redirect' => 'stock', 'results' => '100']) }}">100</a>
			</div> --}}
			{!! $items->appends(request()->query())->render()!!}
		</div>
		<div id="Error"></div>	
	</div>
	{{-- Export customers for Gmail --}}
	@component('vadmin.components.modal')
		@slot('id', 'ExportGmailModal')
		@slot('title', 'Exportar contactos para Gmail')
		@slot('content')
			<div class="filter-date">
				<label for="">Elija un período (Si lo deja vacío se exportaran todos)</label> <br>
				{!! Form::open(['method' => 'GET', 'route' => 'vadmin.exportForGmail', 'class' => 'form-group inner']) !!} 
					{!! Form::date('init_date', null, ['class' => 'form-control']) !!}
					{!! Form::date('expire_date', null, ['class' => 'form-control']) !!}
					<button type="submit" class="btn btnMain btn-sm"> <i class="fab fa-google"></i> EXPORTAR</button>
				{!! Form::close() !!}	
			</div>
		@endslot
		@slot('button')
		@endslot
	@endcomponent



	{{-- Export customers with no closed orders --}}
	@component('vadmin.components.modal')
		@slot('id', 'ExportCustomersOrdersModal')
		@slot('title', 'Exportar clientes que no han realizado compras')
		@slot('content')
			<div class="filter-date">
				<label for="">Elija un período (Si lo deja vacío se exportaran todos)</label> <br>
				{!! Form::open(['method' => 'GET', 'route' => 'vadmin.exportCustomersOrders', 'class' => 'form-group inner']) !!} 
					{!! Form::date('init_date', null, ['class' => 'form-control']) !!}
					{!! Form::date('expire_date', null, ['class' => 'form-control']) !!}
					<button type="submit" class="btn btnMain btn-sm"> <i class="fas fa-bed"></i> EXPORTAR</button>
				{!! Form::close() !!}	
			</div>
		@endslot
		@slot('button')
		@endslot
	@endcomponent


	{{-- Export customers with no closed orders --}}
	@component('vadmin.components.modal')
		@slot('id', 'ExportSleepCustomersModal')
		@slot('title', 'Exportar clientes que no han realizado compras')
		@slot('content')
			<div class="filter-date">
				<label for="">Elija un período (Si lo deja vacío se exportaran todos)</label> <br>
				{!! Form::open(['method' => 'GET', 'route' => 'vadmin.exportSleepCustomers', 'class' => 'form-group inner']) !!} 
					{!! Form::date('init_date', null, ['class' => 'form-control']) !!}
					{!! Form::date('expire_date', null, ['class' => 'form-control']) !!}
					<button type="submit" class="btn btnMain btn-sm"> <i class="fas fa-bed"></i> EXPORTAR</button>
				{!! Form::close() !!}	
			</div>
		@endslot
		@slot('button')
		@endslot
	@endcomponent

		{{-- Export customers --}}
	@component('vadmin.components.modal')
		@slot('id', 'ExportCustomers')
		@slot('title', 'Exportar clientes')
		@slot('content')
			<div class="filter-date">

				<label for="">Elija un período</label> <br>
				{!! Form::open(['method' => 'GET', 'route' => 'vadmin.exportAllCustomersSheet', 'class' => 'form-group inner']) !!} 
					{!! Form::date('from', null, ['class' => 'form-control', 'required' => '']) !!}
					{!! Form::date('to', null, ['class' => 'form-control', 'required' => '']) !!}
					<button  onClick="toggleExportTimer()" type="submit" class="btn btnMain btn-sm"> <i class="fas fa-bed"></i> EXPORTAR</button>
					

				{!! Form::close() !!}	
				<p> Si el perído que selecciona es muy extenso, puede que la cantidad de datos sea muy grande y no se pueda procesar la solicitud.</p>


				<br>
				<div id="ExportLoader" class="Hidden"> 
				<img src="{{ asset('images/gral/loader-sm.svg') }}" alt="Loader">
				<b>Exportando, por favor, espere.</b>
				</div>
			</div>
		@endslot
		@slot('button')
		@endslot
	@endcomponent



@endsection




{{-- SCRIPT INCLUDES --}}
@section('scripts')
	@include('vadmin.components.bladejs')
	<script>
		allowEnterOnForms = true;

		function toggleExportTimer() {

			$('#ExportLoader').removeClass("Hidden");

			setTimeout(function(){ 
				$('#ExportLoader').addClass("Hidden");
			}, 5000);

		}

	</script>
@endsection

