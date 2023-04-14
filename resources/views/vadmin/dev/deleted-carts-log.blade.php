@extends('vadmin.partials.main')
@section('title', 'Vadmin | Logs del sistema')

{{-- HEADER --}}
@section('header')
	@component('vadmin.components.header-list')
		@slot('breadcrums')
		    <li class="breadcrumb-item"><a href="{{ url('vadmin')}}">Inicio</a></li>
            <li class="breadcrumb-item active">Logs del Sistema</li>
		@endslot
		@slot('actions')
			{{-- Actions --}}
			<div class="list-actions">

		@endslot
		@slot('searcher')
			{{-- @include('vadmin.catalog.searcher') --}}
		@endslot
	@endcomponent
@endsection

{{-- CONTENT --}}
@section('content')
	<div class="list-wrapper">
		{{-- Search --}}
		<div class="row inline-links">
		
		</div>
		<div class="row">
			@component('vadmin.components.list')
				@slot('actions', '')
				@slot('title', 'LOGS del Sistema')
				@slot('tableTitles')
                    <th>Tarea</th>
                    <th>Detalles</th>
                    <th>Fecha de creación</th>
                    <th>Fecha de eliminación</th>
                @endslot
                @slot('tableContent')
                    @foreach($logs as $item)
                        <tr>
                            <td>{{ $item->name }}</td>
                            <td>{{ $item->details }}</td>
                            <td>{{ $item->item_creation_date }}</td>
                            {{-- Created at is elimination time --}}
                            <td>{{ $item->created_at->format('d/m/Y') }}</td>
                        </tr>			
                    @endforeach
                @endslot
			@endcomponent
			{{--  Pagination  --}}
			{!! $logs->render() !!}
		</div>
		<div id="Error"></div>
	</div>
@endsection

@section('scripts')
@endsection

@section('custom_js')

@endsection