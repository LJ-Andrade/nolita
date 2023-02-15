@extends('vadmin.partials.main')
@section('title', 'VADmin | Nuevo artículo')

@section('styles')
	{!! Html::style('plugins/texteditor/trumbowyg.min.css') !!}
	{!! Html::style('plugins/jqueryFileUploader/fileuploader.css') !!}
	{!! Html::style('plugins/jqueryFileUploader/jquery.fileuploader.css') !!}
	{!! Html::style('plugins/jqueryFileUploader/jquery.fileuploader-thumbnailtheme.css') !!}
	{{-- {!! Html::style('plugins/jqueryfiler/themes/jquery.filer-dragdropbox-theme.css') !!} --}}
	{!! Html::style('plugins/chosen/chosen.min.css') !!}
	{{-- {!! Html::style('plugins/colorpicker/spectrum.css') !!} --}}
@endsection

@section('header')
	@component('vadmin.components.header')
		@slot('breadcrums')
			<li class="breadcrumb-item"><a href="{{ url('vadmin')}}">Inicio</a></li>
			<li class="breadcrumb-item"><a href="{{ route('catalogo.index')}}">Listado de artículos</a></li>
			<li class="breadcrumb-item active">Creación</li>
		@endslot
		@slot('actions')
			<div class="list-actions">
				<h1>Creación de nuevo artículo</h1>
				{{-- Edit --}}
				<a href="#" id="EditBtn" class="btn btnGreen Hidden"><i class="icon-pencil2"></i> Editar</a>
			</div>
		@endslot
	@endcomponent
@endsection

@section('content')
	<div class="inner-wrapper">
		{!! Form::open([
				'id' => 'StoreArticleForm', 
				'method' => 'POST', 
				'route' => 'catalogo.store', 
				'enctype' => 'multipart/form-data',
				'files' => true, 
				'class' => 'row big-form', 
				'data-parsley-validate' => ''
			]) !!}	
			@include('vadmin.catalog.form')
			<div class="form-actions right">
				<a href="{{ route('catalogo.index')}}">
					<button type="button" class="btn btnRed">
						<i class="icon-cross2"></i> Cancelar
					</button>
				</a>
				<button id="StoreArticleBtn" type="button" class="btn btnGreen">
					<i class="icon-check2"></i> Guardar
				</button>
			</div>
		{!! Form::close() !!}
	</div> 
	<div id="Error"></div>
@endsection

@section('scripts')
	<script type="text/javascript" src="{{ asset('plugins/texteditor/trumbowyg.min.js')}} "></script>
	<script type="text/javascript" src="{{ asset('plugins/chosen/chosen.jquery.min.js') }}" ></script>
	<script type="text/javascript" src="{{ asset('plugins/validation/parsley.min.js') }}" ></script>
	<script type="text/javascript" src="{{ asset('plugins/validation/es/parsley-es.min.js') }}" ></script>
	<script type="text/javascript" src="{{ asset('plugins/jqueryFileUploader/jquery.fileuploader.min.js')}} "></script>
	<script type="text/javascript" src="{{ asset('js/vadmin-forms.js') }}" ></script>
	@include('vadmin.components.bladejs')
	<script>
		// Init text editor
		$.trumbowyg.svgPath = '{{ asset('plugins/texteditor/icons.svg') }}';
		$('.Textarea-Editor').trumbowyg();

		$('#StoreArticleBtn').click(function(){
			let formData = $('#StoreArticleForm').serialize();

			$.ajax({
				url: "{{ route('vadmin.catalog_store_validation') }}",
				method: 'POST',
				dataType: 'JSON',
				data: formData,
				success: function (data) {	
					if(data.response == 'success')
					{
						$('#StoreArticleForm').submit();
					}
					else
					{
						let errors = "";
						for (var i = 0; i <= data.details.length -1; i++){
							errors += data.details[i] + "</br>";
						}
						alert_error("", errors);
					}

				},
				error: function (data) {
					$('#Error').html(data.responseText);
					// alert_error("", data.responseText);
					console.log(data);
				}
			});

		});

	</script>
@endsection

