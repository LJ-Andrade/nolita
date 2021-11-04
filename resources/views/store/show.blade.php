@extends('store.partials.main')

@section('meta')
	<meta property="og:title" content="{{ $article->name }}">
	<meta property="og:description" content="{{ $article->description }}">
	<meta property="og:url" content="{{ url()->full() }} ">
	
	@if($article->images->count() > 0)
		<meta property="og:image" content="{{ url('')  . '/webimages/catalogo/'. $article->images[0]->name }}">
	@else 
		<meta property="og:image" content="http://nolita.test/images/gen/catalog-gen.jpg">
	@endif
	<meta property="product:retailer_item_id" content="{{ $article->id }}">
	<meta property="product:brand" content="Nolita">
	<meta property="product:availability" content="{{ $totalStock }}">
	<meta property="product:condition" content="new">
	<meta property="product:price:amount" content="{{ intval(finalPriceRounded($article->reseller_price, $article->reseller_discount)) }}">
	<meta property="product:price:currency" content="ARS">
@endsection

@section('content')
{{-- Store current page allowing return here after edit --}}
<input type="hidden" value="@if(isset($previousUrl)) {{ $previousUrl }}  @endif" name="previousUrl">
<div class="container padding-bottom-3x mb-1 marg-top-25">
	<div class="row product-show">
		<div class="col-md-12 top-actions">
			@if(isset($previousUrl))
				<a href="{{ route('store', [$previousUrl]) }}">
			@else
				<a href="{{ url('tienda') }}">
			@endif
				<button class="btn btn-main mb-1">
					<i class="icon-arrow-left"></i>&nbsp;Volver a la tienda
				</button>
			</a>
		</div>
		<div class="col-xs-12 col-sm-12 col-md-6 col-lg-5 col-xl-6 col-xs-pull-12 image">
			{{-- Title Mobile --}}
			<div class="title-mobile">
				<span class="text-medium">Categoría:&nbsp;</span>
				<a class="navi-link" href="#">{{ $article->category->name }}</a>
				{{--  Article Name  --}}
				<h2 class="text-normal"><b>{{ $article->name }}</b></h2>
			</div>
			
			<div class="row product-gallery">
				<div class="col-xs-12 col-sm-3 col-md-3 pad0">
					<ul class="product-thumbnails">
					@foreach($article->images as $image)
						<li>
						<a href="#{{ $image->id }}">
								<img src="{{ asset('webimages/catalogo/'. $image->name) }}" class="CheckCatalogImg" alt="Producto">
							</a>
						</li>
					@endforeach
					</ul>
				</div>
				<div class="col-xs-12 col-sm-9 col-md-9 images-container pad0">
					<div class="gallery-wrapper">
						@foreach($article->images as $index => $image)
						<div class="gallery-item {{ $index == 0 ? 'active' : '' }}">
						<a href="{{ asset('webimages/catalogo/'. $image->name) }}" data-hash="{{ $image->id }}" data-size="500x750"><i class="icon-zoom-in"></i></a>
					</div>
					@endforeach
					</div>
					<div class="product-carousel owl-carousel">
						@if(!$article->images->isEmpty())
						@foreach($article->images as $image)
						<div data-hash="{{ $image->id }}"><img class="CheckCatalogImg" src="{{ asset('webimages/catalogo/'. $image->name) }}" alt="Product"></div>
						@endforeach
						@else
						<img src="{{ asset($article->featuredImageName()) }}" class="CheckCatalogImg" alt="Producto del Catálogo">
						@endif
					</div>
				</div>
			</div>
		</div>

		{{-- <div class="padding-top-2x hidden-md-up"></div> --}}
		<div class="col-xs-12 col-sm-12 col-md-6 col-lg-7 col-xl-6 products-details">
			{{-- Favs --}}
			<div class="fav-container">
				@if(Auth::guard('customer')->check())
					<a class="AddToFavs fa-icon fav-icon-nofav @if($isFav) fav-icon-isfav @endif"
					data-id="{{ $article->id }}" data-toggle="tooltip" title="Agregar a Favoritos">
					</a>
					@else
					<a href="{{ url('tienda/login') }}" class="fa-icon fav-icon-nofav"></a>
				@endif
			</div>
			{{-- Title Desktop --}}
			<div class="title-desktop">
				<h4>Categoría:&nbsp; <a class="color-white" href="#"><b>{{ $article->category->name }}</b></a></h4>
				{{--  Article Name  --}}
				<div class="product-title"><b>{{ $article->name }}</b></div>
				<span class="product-code"> #{{ $article->code }}</span>
			</div>
			{{-- PRICE --}}
			@if(Auth::guard('customer')->check())
			<div class="prices">
				@if($article->reseller_discount > 0)
					% {{ $article->reseller_discount }} de DESCUENTO!!
					<br>
					<span class="main-price"><b>${{ calcValuePercentNeg($article->reseller_price, $article->reseller_discount) }}</b></span>
					<span class="if-discount">($ {{ $article->reseller_price }})</span>
					@else
					<span class="main-price"><b>$ {{ $article->reseller_price }}</b></span>
				@endif
			</div>
			@else
			<br>
			@endif
			{{-- Article Description --}}
			<p class="description">{{ strip_tags($article->description) }}</p>
			<h4>Tela:&nbsp; <span class="color-white" href="#">{{ $article->textile }}</span></h4>
			{{-- <h4>Talle:&nbsp; <a class="color-white" href="#"><b>Único</b></a></h4> --}}
			@if(Auth::guard('customer')->check())
			<div class="row">
				<div class="col-sm-12 descriptions">
					{{-- NOLITA --}}
					{!! Form::open(['id' => 'AddToCartForm', 'class' => 'form-group price', 'onchange' => 'checkVariantStock()', 
						'data-route' => (url('tienda/checkVariantStock')) ]) !!}
						<input type="hidden" name="article_id" value="{{ $article->id }}">
						<div class="row color-selector">
							<div class="col-md-12 pad0">
								<div class="btn-group-toggle form-selector" data-toggle="buttons">
									<span>Colores:</span>
									@foreach($colors as $id => $name)
										<label class="ColorsSelector btn button-radio-hidden btn-main-sm-hollow">
											<input onclick="checkVariantStock()" name="color_id" value="{{ $id }}" type="radio" autocomplete="off"> {{ $name }}
										</label>
									@endforeach
								</div>
								<div class="btn-group-toggle form-selector" data-toggle="buttons">
									<span>Talles:</span>
									@foreach($sizes as $id => $name)
										<label class="SizesSelector btn button-radio-hidden btn-main-sm-hollow">
											<input onclick="checkVariantStock()" name="size_id" value="{{ $id }}" type="radio" autocomplete="off"> {{ $name }}
										</label>
									@endforeach
								</div>
								{{-- <input type="hidden" name="size_id" value="{{ $article->size->first()->id }}"> --}}
							</div>
						</div>
						@if(env('BUY_ENABLED'))
							<div class="row">
								{{-- Display Remaining Stock --}}
								<span class="AvailableStock action-info-container"></span>
							</div>
							@if($article->status == 1)
							<div class="input-with-btn">
								<input id="MaxQuantity" class="form-control input-field short-input" name="quantity" type="number" min="1" max="{{ $article->stock }}" value="1" placeholder="1" required>
								<input type="submit" id="AddToCartFormBtn" class="btn input-btn"" value="Agregar al carro" disabled>
							</div>
							@else
								Artículo no disponible al momento
							@endif
							<input type="hidden" value="{{ $article->id }}" name="articleId">
						@else
							<button class="btn main-btn" disabled>Venta Suspendida</button>
							<div style="margin-top: 10px; border: 1px solid #fff; padding: 10px">
							@if(env('BUY_DISABLED_MESSAGE') != '')
								<h3 style="color: #000">{{ env('BUY_DISABLED_MESSAGE') }}</h3>
							@endif
							</div>

						@endif
					{!! Form::close() !!}
				</div>
			</div>
			@else
			<br>
			<div class="col-md-12 pad0">
				<h4>Colores:&nbsp; <a class="color-white" href="#">
					<b>@foreach($colors as $id => $name) {{ $name }} @if(!$loop->last) | @endif @endforeach</b>
				</a></h4>
				<br>
				<h4>Talles:&nbsp; <a class="color-white" href="#">
					<b>@foreach($sizes as $id => $name) {{ $name }} @if(!$loop->last) | @endif @endforeach</b>
				</a></h4>
				{{-- <div class="btn-group-toggle" data-toggle="buttons">
					@foreach($colors as $id => $name)
						<label class="btn btn-main-sm-hollow">
							<input onclick="checkVariantStock()" name="color_id" value="{{ $id }}" type="radio" checked autocomplete="off"> {{ $name }} dsds
						</label>
					@endforeach
				</div>
				<input type="hidden" name="size_id" value="{{ $article->size->first()->id }}"> --}}

			</div>
			<div class="col-md-12 login-register-cta">
			
				<a href="{{ route('customer.login') }}" class="btn main-btn-sm login-btn">
					<span class="info">Ya tenés cuenta ? </span> <br>
					<span class="text">INGRESAR</span>
				</a> 
				<a href="{{ url('tienda/registro') }}" class="btn main-btn-sm register-btn">
					<span class="info">No tenés cuenta ?</span> <br>
					<span class="text">REGISTRATE</span>
				</a>
		
			</div>
			@endif

			@if(env('SHOW_SECTION_BOTTOM_MESSAGE') != '')
				<span style="color: #737373">
					{{ env('SHOW_SECTION_BOTTOM_MESSAGE') }}
				</span>
			@endif
			
		</div>
	</div>
</div>

{{-- Videos --}}
@if($article->video != null)
	<div class="container product-video-container">
		<div class="row">
			{!! $article->video !!}
		</div>
	</div>
@endif
	
<!-- Photoswipe container // This Shows Big Image Preview -->
<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
	<div class="pswp__bg"></div>
	<div class="pswp__scroll-wrap">
		<div class="pswp__container">
			<div class="pswp__item"></div>
			<div class="pswp__item"></div>
			<div class="pswp__item"></div>
		</div>
		<div class="pswp__ui pswp__ui--hidden">
			<div class="pswp__top-bar">
				<div class="pswp__counter"></div>
				<button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
				<button class="pswp__button pswp__button--share" title="Share"></button>
				<button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
				<button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
				<div class="pswp__preloader">
					<div class="pswp__preloader__icn">
						<div class="pswp__preloader__cut">
							<div class="pswp__preloader__donut"></div>
						</div>
					</div>
				</div>
			</div>
			<div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
				<div class="pswp__share-tooltip"></div>
			</div>
			<button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>
			<button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>
			<div class="pswp__caption">
				<div class="pswp__caption__center"></div>
			</div>
		</div>
	</div>
</div>
{{-- <div id="Error"></div> --}}
@endsection

@section('scripts')
	@include('store.components.bladejs')
	<script>
		let sizes = $('.SizesSelector');
		let colors = $('.ColorsSelector');

		if(sizes.length == 1)
			sizes.click();
		if(colors.length == 1)
			colors.click();
	</script>
@endsection