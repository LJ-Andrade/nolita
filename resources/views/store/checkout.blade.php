@extends('store.partials.main')

@section('styles')
	<style>
		.floating-bottom-cta {  
			bottom: 70px
		}

		tr.no-border > td {
			border-top: 0 !important
		}
	</style>
@endsection

@section('content')
	<input id="CartId" class="form-control" type="hidden" name="cart_id" value="{{ $activeCart['rawdata']->id }}">
	{{--------- Checkout Error Messages ----------}}
	{{-- Missing shipping method Message --}}
	@if(session('error')=='low-quantity')
		<div class="alert alert-success alert-dismissible fade show text-center margin-bottom-1x">
			<span class="alert-close" data-dismiss="alert"></span>
			<span>Para realizar compras mayorístas debe incluír al menos {{ $settings->reseller_min }} prendas.</span><br>
			<span>{{ $activeCart['totalItems'] }} prendas incluídas</span> - 
			<span>Resta incluír: {{ $activeCart['goalQuantity'] }} más </span> 
		</div>
	@endif
  	<div class="container checkout-container padding-bottom-3x mb-2 marg-top-25">
		<div class="back-to-store"><a href="{{ url('tienda') }}"><i class="icon-arrow-left"></i> Volver a la tienda</a></div>
   		<div class="row">
			<div class="col-md-12">
				<h3>Carro de Compras | Checkout</h3> 
				{{-- <p>Pedido N: #{{ $activeCart['rawdata']->id }}</p> --}}
				@if(Auth::guard('customer')->user()->group == '3')
				<div class="warning">
					@if($settings->reseller_min > 0 || $settings->reseller_money_min > 0)
						<span>Compra mínima:
						{{-- Minimum quantity --}}
						@if($settings->reseller_min > 0)
							<b>
								<span id="MinQuantityText">
									@if($activeCart['orderMinQuantity'] > 0 )
										{{ $activeCart['orderMinQuantity'] }} 
									@else
										{{ $settings->reseller_min }} 
									@endif
								</span>
								unidades
							</b>
						@endif
						
						@if($settings->reseller_min > 0 && $settings->reseller_money_min > 0)
						o
						@endif

						@if($settings->reseller_money_min > 0)
						{{-- Minimum money GIVE ME DA MANAAAY --}}
						<b>$ {{ $settings->reseller_money_min }}</b>
						@endif
						
						</span>
					@endif
				</div>
					{{-- @if($settings->reseller_money_min > 0)
						<div class="warning"></div>
					@endif --}}
				@endif
				<div class="table-responsive shopping-cart">
					{{-- CART PRODUCTS LIST --}}
					<table class="table">
						<thead>
							<tr>
								<th>Detalle</th>
								<th>P.U.</th>
								<th>Cantidad</th>
								<th>SubTotal</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							@foreach($activeCart['rawdata']->items as $item)
							<tr id="Item{{$item->id}}">
								<td>
									<div class="product-item">
										<a class="product-thumb" href="{{ url('tienda/articulo/'.$item->article->id) }}">
											<img class="CheckCatalogImg" src="{{ asset($item->article->featuredImageName()) }}" alt="{{ $item->name }}">
										</a>
										<div class="product-info">
											<h4 class="product-title">
												<a href="{{ url('tienda/articulo/'.$item->article->id) }}">
													{{ $item->article->name }}
												</a>
											</h4>
											<span><em>Código:</em> #{{ $item->article->code }}</span>
											<span><em>Talle: {{ $item->size}}</em></span>
											<span><em>Color: {{ $item->color }}</em></span>
											<span><em>Textil: {{ $item->textile }}</em></span>
										</div>
									</div>
								</td>
								{{-- Reseller Item Prices --}}
								@php($articlePrice = '0')
								<td class="text-lg dont-break"> $
									@if(Auth::guard('customer')->user()->group == '3')
										{{ $articlePrice = showPrice($item->article->reseller_price, $item->article->reseller_discount) }}
									@else
										{{ $articlePrice = showPrice($item->article->price, $item->article->discount) }}
									@endif
								</td>
								{{-- Add Quantity to Cart Item --}}
								<td>
									<div class="input-with-btn input-with-btn-mobile">
										{{-- Send this data to JSON via js with .Item-Data class --}}
										@if($item->variant)
										<input class="Item-Data small-input under-element" name="data" type="number" 
										min="1"  max="{{ $item->quantity + $item->variant->id }}" value="{{ $item->quantity }}" placeholder="1" required="" 
										data-price="{{$articlePrice}}" data-variant="{{ $item->variant_id }}" data-id="{{ $item->id }}">
										<div class="under-input"> Stock: {{ $item->variant->stock }} </div>
										@else
											Sin Stock
										@endif
									</div>
								</td>
								<td>$ <span class="{{ $item->id }}-TotalItemPrice TotalItemPrice">{{ ($articlePrice * $item->quantity) }}</span></td>
								{{-- REMOVE ITEMS FROM CART --}}
								<td class="text-center">
									<a onclick="removeFromCart('{{ route('store.removeFromCart') }}', 
																{{ $item->id }}, 
																{{ $item->variant_id }}, 
																{{ $item->quantity }}, 
																'#Item'+{{ $item->id }}, 'reload');"
																
																class="icon-only-btn">
										
										<i class="far fa-trash-alt"></i></a>

									{{-- <a onclick="removeFromCart('{{ route('store.removeFromCart') }}', 
																{{ $item->id }}, 
																{{ $item->variant_id }}, 
																{{ $item->quantity }}, 
																'#Item'+{{ $item->id }}, 'reload');"> --}}
										{{-- <i class="far fa-trash-alt"></i></a> --}}
										
									{{-- {!! Form::open(['route' => 'store.removeFromCart', 'method' => 'POST', 'class' => 'loader-on-submit']) !!}	
										{{ csrf_field() }}
										<input type="hidden" name="itemid" value="{{ $item->id }}">
										<input type="hidden" name="quantity" value="{{ $item->quantity }}">
										<button type="submit" class="icon-only-btn"><i class="far fa-trash-alt"></i></button>
									{!! Form::close() !!} --}}
								</td>
							</tr>
							@endforeach
							<tr>
								<td></td>
								<td></td>
								<td>SUBTOTAL</td>
								<td>$ {{ $activeCart['cartSubTotal']}}</td>
								<td></td>
							</tr>
							{{-- {{ dd($activeCart)}} --}}
							@if($activeCart['orderDiscount'] > 0 )
							<tr class="no-border">
								<td></td>
								<td></td>
								<td>Descuento</td>
								<td>
									% {{ $activeCart['rawdata']->order_discount }}
								</td>
							</tr>
							<tr class="no-border">
								<td></td>
								<td></td>
								<td><b>TOTAL</b></td>
								<td>
									<b>$ {{ $activeCart['cartTotal'] }}</b>
								</td>
							</tr>
							@endif
						</tbody>
					</table>
				</div>
				<div class="row">
					<div class="col-md-12">
						<div class="form-group small-form">
							<label class="sub-title">¿ Tenés un cupón ?</label>
							<div id="CouponDiv">
								<label>Ingresá el código aquí</label>
								<div class="coupon-container">
									<input id="CuponCodeInput" class="form-control mw-200" type="text" name="coupon_id" value="">
									<div class="button-and-loader">
										<button id="CheckCoupon" type="button" class="btn btn-primary">Ingresar</button>
										<div class="CouponLoader Hidden"><img src="{{ asset('images/gral/loader-sm.svg') }}" alt=""> Validando...</div>
									</div>
									<div class="coupon-message-validation" id="CouponValidationMessage"></div>
								</div>
							</div>
							<div id="SettedCoupon" class="coupon-message Hidden">
								<div class="inner">
									<span class="big">Cupón válido !</span>
								</div>
							</div>	
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-md-12">
						<div class="form-group small-form">
							@if($activeCart['orderDiscount'] > 0 )
								{{-- If order has claimed coupon --}}
								<div class="coupon-message">
									<div class="inner">
										<span class="small">Esta compra cuenta con un</span>
										<span class="big">%{{ $activeCart['rawdata']->order_discount }} </span>
										<span class="small">de descuento ! </span>
									</div>
								</div>
								<br>
							@endif							
						</div>
					</div>
				</div>
				
				
					<div class="col-md-12">
						<div class="text-right hide-768">
							<button type="button" class="UpdateDataBtn btn btn-main">Actualizar <i class="fas fa-sync-alt"></i></button>
							<button type="button" class="SubmitDataBtn btn btn-main cursor-pointer">Continuar <i class="fa fa-arrow-right"></i></button>
						</div>
					</div>
				</div>
				<div class="back-to-store"><a href="{{ url('tienda') }}"><i class="icon-arrow-left"></i> Volver a la tienda</a></div>
			</div>{{-- / col-md-12 --}}
		</div> {{-- / Row --}}
	</div> {{-- / Container --}}
	{{-- <div id="Error"></div> --}}
	<button type="button" class="SubmitDataBtn btn btn-block btn-bottom mobile-finish-button main-btn">
		Continuar <i class="fas fa-arrow-right"></i>
	</button>
@endsection

@section('scripts')
	@include('store.components.bladejs')
	<script>
		$('.TotalItemPrice').each(function (index) {
			sum += parseInt($(this).html());
		});
	</script>

@endsection
