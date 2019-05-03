@extends('vadmin.partials.main')
@section('title', 'Vadmin | Listados de artículos del catálogo')

{{-- HEADER --}}
@section('header')
	@component('vadmin.components.header-list')
		@slot('breadcrums')
		    <li class="breadcrumb-item"><a href="{{ url('vadmin')}}">Inicio</a></li>
            <li class="breadcrumb-item active">Listado de artículos</li>
		@endslot
		@slot('actions')
			{{-- Actions --}}
			<div class="list-actions">
				<a href="{{ route('catalogo.create') }}" class="btnSm btnMain"><i class="icon-plus-round"></i>  Nuevo artículo</a>
				<button id="SearchFiltersBtn" class="btnSm btnMain"><i class="icon-ios-search-strong"></i></button>
				{{-- Add Similar --}}
				<button class="CreateFromAnotherBtn btnSm btnMain Hidden"><i class="icon-pencil2"></i> Publicar Similar</button>
				<input id="CreateFromAnotherId" type="hidden">
				{{-- Edit --}}
				<button class="EditBtn btnSm btnGreen Hidden"><i class="icon-pencil2"></i> Editar</button>
				<input id="EditId" type="hidden">				
				{{-- Delete --}}
				{{-- THIS VALUE MUST BE THE NAME OF THE SECTION CONTROLLER --}}
				<input id="ModelName" type="hidden" value="catalogo">
				<button class="DeleteBtn btnSm btnRed Hidden"><i class="icon-bin2"></i> Eliminar</button>
				<input id="RowsToDeletion" type="hidden" name="rowstodeletion[]" value="">
				{{-- If Search --}}
				{{-- @if(isset($_GET['code']) || isset($_GET['title']) || isset($_GET['category']) || isset($_GET['orden']))
				<a href="{{ url('vadmin/catalogo') }}"><button type="button" class="btn btnGrey">Mostrar Todos</button></a>
				@endif --}}
			</div>
		@endslot
		@slot('searcher')
			@include('vadmin.catalog.searcher')
		@endslot
	@endcomponent
@endsection

{{-- CONTENT --}}
@section('content')
{{-- {{dd($articles)}} --}}
	<div class="list-wrapper">
		{{-- Search --}}
		<div class="row inline-links">
			<b>Órden:</b> 
			@if(isset($_GET['status']))
				@php($status = $_GET['status'])
			@else
				@php($status = 1)
			@endif
			<a href="{{ route('catalogo.index', ['orden_af' => 'ASC', 'status' => $status]) }}" >A-Z</a>
			<a href="{{ route('catalogo.index', ['orden_af' => 'DESC', 'status' => $status]) }}" >Z-A</a>
			<a href="{{ route('catalogo.index', ['orden_af' => 'DESC', 'status' => $status, 'show' => 'discounted' ]) }}" >Con descuento</a>
			{{-- <a href="{{ route('catalogo.index', ['orden' => 'ASC']) }}">Stock Bajo</a> 
			<a href="{{ route('catalogo.index', ['orden' => 'DESC']) }}">Stock Alto</a>
			<a href="{{ route('catalogo.index', ['orden' => 'limitados']) }}" >Stock Limitado</a> --}}
		</div>
		<div class="row">
			@component('vadmin.components.list')
				@slot('actions', '')
				@slot('title', 'Listado de artículos de la tienda')
				@slot('tableTitles')
					@if(!$articles->count() == '0')
						<th class="w-50"></th>
						<th></th>
						<th>Cód.</th>
						<th>Título</th>
						<th>Variantes (Color / Talle - Stock)</th>
						<th>Precio</th>
						<th>Descuento</th>
						<th>Estado</th>
					@endslot
					@slot('tableContent')
						@foreach($articles as $item)
							<tr id="ItemId{{$item->id}}">
								<td class="mw-50">
									<label class="CheckBoxes custom-control custom-checkbox list-checkbox">
										<input type="checkbox" class="List-Checkbox custom-control-input row-checkbox" data-id="{{ $item->id }}">
										<span class="custom-control-indicator"></span>
										<span class="custom-control-description"></span>
									</label>
								</td>
								{{-- THUMBNAIL --}}
								<td class="thumb">
									<a href="{{ url('vadmin/catalogo/'.$item->id.'/edit') }}">
										@if($item->featuredImageName())
											<img class="CheckImg" src="{{ asset($item->featuredImageName()) }}">
										@endif
									</a>
								</td>
								<td class="mw-100"><a href="{{ url('vadmin/catalogo/'.$item->id.'/edit') }}"> #{{ $item->code }} </a>
								</td>
								{{-- NAME --}}
								<td>
									<input class="editable-input" onfocus="event.target.select()" type="text" value="{{ $item->name }}" min="0">
									<div class="editable-input-data" data-id="{{ $item->id }}" 
										data-route="update_catalog_field" data-field="name" data-type="string" data-action="reload" data-value="">
									</div>
								</td>
								<td style="white-space: normal">
									@foreach($item->variants as $variant)
										<div class="small-badge-with-data">
											{{ $variant->combination }} <div class="inner"><span class="inner-data">{{ $variant->stock }}</span></div>
										</div>
									@endforeach
								</td>
								@if($item->reseller_discount > 0)
									<td>$ {{ showPrice($item->reseller_price, $item->reseller_discount) . ' ( $ '. $item->reseller_price.' )'}}</td>
								@else
									<td>$ {{ $item->reseller_price }}</td>
								@endif
									<td>% {{ $item->reseller_discount }}</td>
								{{-- STATUS --}}
								<td class="w-50 pad0 centered">
									<label class="switch">
										<input class="UpdateStatus switch-checkbox" type="checkbox" 
										data-model="CatalogArticle" data-id="{{ $item->id }}"
										@if($item->status == '1') checked @endif>
										<span class="slider round"></span>
									</label>
								</td>
							</tr>					
						@endforeach
						@else 
							@slot('tableTitles')
								<th></th>
							@endslot
							@slot('tableContent')
								<tr>
									<td class="w-200">No se han encontrado items</td>
								</tr>
							@endslot
						@endif
				@endslot
			@endcomponent
			{{--  Pagination  --}}
			<div class="inline-links">
				<b>Resultados por página:</b>
				<a href="{{ route('catalogo.index', ['orden' => 'ASC', 'results' => '50', 'status' => $status]) }}">50</a>
				<a href="{{ route('catalogo.index', ['orden' => 'ASC', 'results' => '100', 'status' => $status]) }}">100</a>
			</div>
			{!! $articles->appends(request()->query())->render() !!}
		</div>
		<div id="Error"></div>
	</div>
@endsection

@section('scripts')
	@include('vadmin.components.bladejs')
@endsection

@section('custom_js')
	<script>
		allowEnterOnForms = true;
	</script>
@endsection