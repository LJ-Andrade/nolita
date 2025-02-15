@extends('store.partials.main')

@section('header-image')
{{-- <img src="{{ asset('images/web/home-banner.jpg')}}" alt="Nolita Banner">		 --}}
	{{-- <div class="index-header">	
	</div> --}}
@endsection

@section('content')
	<div class="header-banner">
		<div class="desktop"><img src="{{ asset('images/web/home-banner.jpg')}}" alt="Home Promo Banner"></div>
		<div class="mobile"><img src="{{ asset('images/web/home-banner-mobile.jpg')}}" alt="Home Promo Banner"></div>
	</div>
	<div class="mobile-filters">
		@include('store.partials.filters-mobile')
	</div>
	{{-- <div class="filter-container">
		
	</div> --}}
	<div id="main" class="main-container container-fluid padding-bottom-3x mb-1">
		<div class="row">
			{{-- col-xs-12 col-lg-9 col-sm-8 col-md-8 --}}
			<div class="col-sm-3 col-md-3 col-lg-2 pad0 hide-768">
				@include('store.partials.filter-sidebar')
			</div>
			<div id="MainContent" class="col-xs-12 col-sm-12 col-md-9 col-lg-10">
				{{-- @if(!isset($_GET['checkout-on']))
					@if(isset($_GET['page']) && !isset($search) && count($_GET) == 1)
					@else
						@if(isset($search) && $search == true || count($_GET) > 0 && !isset($_GET['results']))
							<div class="results-info">
								@if($articles->count() == '1')
									1 artículo encontrado <br>
								@elseif($articles->count() == '0')
						
								@else
									Mostrando resultados de la búsqueda.
								@endif
							</div>
						@endif
					@endif
				@endif --}}
				<!-- Products Grid -->
				<div class="row SkeletonsArticles skeleton-articles">
						<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-3 skeleton-article"><img src="{{ asset('images/gen/catalog-gen.jpg') }}" alt=""></div>
						<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-3 skeleton-article"><img src="{{ asset('images/gen/catalog-gen.jpg') }}" alt=""></div>
						<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-3 skeleton-article"><img src="{{ asset('images/gen/catalog-gen.jpg') }}" alt=""></div>
						<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-3 skeleton-article"><img src="{{ asset('images/gen/catalog-gen.jpg') }}" alt=""></div>
				</div>
				<div class="row ArticlesContainer articles-container Hidden">
					@if($articles->count() == '0')
					<div class="no-articles">
						<h3>No se han encontrado artículos</h3>
					</div>
					@endif
					@foreach($articles as $article)
						<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-3 article">
							<div class="inner">
								{{-- =========== Discount Badge =========== --}}
								{{-- ====================================== --}}
								@if($article->reseller_discount > 0)
									<div class="ribbon-square top-right-absolute">
										<div class="text">OFF!</div>
									</div>
								@else
									@foreach($article->tags as $tag)
										@if($tag->name == 'descuento')
											<div class="ribbon-square top-right-absolute">
												<div class="text">OFF!</div>
											</div>
										@endif
									@endforeach
								@endif
								
								{{-- =============== Image ================ --}}
								{{-- ====================================== --}}
								<div class="image">
									@foreach($article->tags as $tag)
										@if($tag->name == 'Edición Limitada')
											<div class="ribbon-bordered-text bottom-left-absolute">
												<div class="text-1">EDICIÓN </div>
												<div class="text-2">LIMITADA</div>
											</div>
											{{-- <div class="overlay-ribbon bottom-left-ribbon">
												<div class="triangle"></div>
												<div class="text" style="top: 52px; right: 41px;">LAST <br>CHANCE</div>
											</div> 	 --}}
											@break
										@elseif($tag->name == 'nuevo')
											<div class="ribbon-square bottom-left-absolute">
												<div class="text">NUEVO</div>
											</div>
											@break
										@elseif($tag->name == 'niñas')
											<div class="ribbon-square bottom-left-absolute">
												<div class="text">MINI NOLITA</div>
											</div>
											@break
										@endif
									@endforeach
									
									<img src="{{ asset($article->featuredImageName()) }}" alt="Producto del Catálogo">
									@if(Auth::guard('customer')->check())
									{{--  Check if product is in favs  --}}
									<a class="AddToFavs add-to-favs fa-icon fav-icon-nofav fav-btn
										@if(in_array($article->id, $favs['articleFavs'])) fav-icon-isfav @endif"
										data-id="{{ $article->id }}" data-toggle="tooltip" title="Agregar a Favoritos">
									</a>
									@endif
									<a href="{{ url('tienda/articulo/'.$article->id) }}">
										<div class="overlay text-center">
											Ver producto
										</div>
									</a>
								</div>
								{{-- ============== Content =============== --}}
								{{-- ====================================== --}}
								<div class="content">
									{{-- ============ Title-Info ============== --}}
									<div class="title-info">
										<a href="{{ url('tienda/articulo/'.$article->id) }}">
											<h3 class="product-title max-text"><b>{{ $article->name }}</b></h3>
										</a>
									</div>
									{{-- =============== Footer =============== --}}
									<div class="footer">
										<div class="col-price pad0" >
											<span class="price" style="color: #333333">
												$ {{ calcValuePercentNeg($article->reseller_price, $article->reseller_discount + 0) }}
											</span>
											@if(Auth::guard('customer')->check())
												
											@endif
										</div>
										<div class="col-add pad0">
											<a href="{{ url('tienda/articulo/'.$article->id) }}">
												<button class="btn btn-main-sm"> Agregar al carro</button>
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					@endforeach
				</div>
				@if($articles->count() != '0')
				<div class="pagination-results">
					<span class="title"><b>Resultados por página:</b></span>
					<a href="{{ route('store', ['results' => '24']) }}">24</a> | 
					<a href="{{ route('store', ['results' => '96']) }}">96</a> |
					<a href="{{ route('store', ['results' => '142']) }}">142</a>
				</div>
				@endif
				{!! $articles->appends(request()->query())->render()!!}
			</div>
			<!-- SideBar -->
			{{-- <div class="CheckoutCart col-sm-4 col-md-4 col-lg-3 checkout-cart">
				@include('store.partials.checkout-cart')
			</div> --}}
		</div>
	</div>
	<div id="Error"></div>
@endsection

@section('scripts')
	
	@include('store.components.bladejs')
	<script>
		$(document).ready(function() {
			$('.SkeletonsArticles').fadeOut(100);
			$('.ArticlesContainer').removeClass('Hidden');
		});
	</script>
@endsection


