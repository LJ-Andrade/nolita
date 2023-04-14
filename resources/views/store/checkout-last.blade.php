@extends('store.partials.main')

@section('styles')
	<style>
		.floating-bottom-cta {  
			bottom: 70px
		}
				
	</style>
@endsection

@section('content')
	<input id="CartId" class="form-control" type="hidden" name="cart_id" value="{{ $activeCart['rawdata']->id }}">
	@if(session('error')=='low-quantity')
		<div class="alert alert-success alert-dismissible fade show text-center margin-bottom-1x">
			<span class="alert-close" data-dismiss="alert"></span>
			Para realizar compras mayorístas debe incluír al menos 12 prendas.<br>
			<span>Prendas incluídas: {{ $activeCart['totalItems'] }} </span><br>
			<span>Resta incluír: {{ $activeCart['goalQuantity'] }} </span> 
		</div>
	@endif
	{{-- Missing shipping method Message --}}
	@if(session('error')=='missing-shipping')
		<div class="alert alert-success alert-dismissible fade show text-center margin-bottom-1x">
			<span class="alert-close" data-dismiss="alert"></span>
			Debe elegir un método de envío<br>
		</div>
	@endif
	{{-- Missing payment method Message --}}
	@if(session('error')=='missing-payment')
		<div class="alert alert-success alert-dismissible fade show text-center margin-bottom-1x">
			<span class="alert-close" data-dismiss="alert"></span>
			Debe elegir una forma de pago<br>
		</div>
	@endif
	{{-- Incomplete Customer Data Message --}}
	@if(session('error')=='missing-data')
		<div class="alert alert-success alert-dismissible fade show text-center margin-bottom-1x">
			<span class="alert-close" data-dismiss="alert"></span>
			Debe completar todos sus datos para poder realizar pedidoss<br>
		</div>
	@endif
	<div class="container checkout-container padding-bottom-3x mb-2 marg-top-25">
		<div class="back-to-store"><a href="{{ route('store.checkout') }}"><i class="icon-arrow-left"></i> Atrás</a></div>
		<div class="row">
			<div class="col-md-12">
				<h3>Carro de Compras | Checkout</h3>
			</div>{{-- / col-md-12 --}}
		</div> {{-- / Row --}}
			{{-- Data & Sidebar --}}
		<div class="row ">
			<div class="col-sm-8">
				{!! Form::open(['route' => 'store.updatePaymentAndShipping', 'class' => 'row small-form loader-on-submit dont-submit-on-enter', 'method' => 'POST']) !!}
					<div class="col-md-6">
						<div class="sub-title"> <i class="far fa-credit-card"></i> Medio de pago</div>
						<input type="hidden" name="id" value="{{ $activeCart['rawdata']->id }}">
						{{-- {!! Form::label('payment_method', 'Seleccione un medio de pago') !!} --}}
						<select onchange="submit()" name="payment_method_id" class="Select-Atribute form-control mb-3" placeholder="Seleccionar forma de pago">
							@if($activeCart['rawdata']->payment_method_id == null)
							<option selected disabled>Seleccione una forma de pago</option>
							@endif
							@foreach($payment_methods as $payment)
							<option  value="{{ $payment->id }}" @if($payment->id == $activeCart['rawdata']->payment_method_id ) selected @endif>
									{{ $payment->name }} @if($payment->percent > 0) - (Recargo %{{ $payment->percent }})@endif
							</option>
							@endforeach
						</select>
					</div>
					<div class="col-md-6">
						<div class="sub-title"><i class="fas fa-truck"></i> Forma de envío</div>
						{{-- {!! Form::label('shipping', 'Seleccione el tipo de envío') !!} --}}
						<select onchange="submit()" name="shipping_id" class="Select-Atribute form-control" placeholder="Seleccionar forma de pago">
							@if($activeCart['rawdata']->shipping_id == null)
								<option selected disabled>Seleccione forma de envío</option>
							@endif
							@foreach($shippings as $shipping)
								<option value="{{ $shipping->id }}" @if($shipping->id == $activeCart['rawdata']->shipping_id ) selected @endif>
									{{ $shipping->name }} @if($shipping->price > 0) - (Costo ${{ $shipping->price }})@endif
								</option>
							@endforeach
						</select>
					</div>
				{!! Form::close() !!} 
			<br>
			
			{{-- Proccess Checkout --}}
			{!! Form::open(['id' => 'CheckoutForm', 'route' => 'store.processCheckout', 'method' => 'POST', 'class' => 'loader-on-submit']) !!}	
				<div class="row small-form">
					<div class="col-md-12">
						<div class="sub-title"><i class="far fa-address-card"></i> Datos de entrega</div>
					</div>
					<div class="col-md-4">
						<div class="form-group">
							<label>Nombre de Usuario</label>
							<input class="form-control dson" type="text" name="username" value="{{ Auth::guard('customer')->user()->username }}" required>
						</div>
					</div>
					<div class="col-md-4">
						<div class="form-group">
							<label>Nombre</label>
							<input class="form-control dson" type="text" name="name" value="{{ Auth::guard('customer')->user()->name }}" required>
						</div>
					</div>
					<div class="col-md-4">
						<div class="form-group">
							<label>Apellido</label>
							<input class="form-control dson" type="text" name="surname" value="{{ Auth::guard('customer')->user()->surname }}" required>
						</div>
					</div>
					<div class="col-md-4">
						<div class="form-group">
							<label>E-mail</label>
							<input class="form-control dson" type="email" name="email" value="{{ Auth::guard('customer')->user()->email }}" required>
						</div>
					</div>
					<div class="col-md-4">
						<div class="form-group">
							<label>Teléfono</label>
							<input class="form-control dson" type="text" name="phone" value="{{ Auth::guard('customer')->user()->phone }}" required>
						</div>
					</div>
					<div class="col-md-4">
						<div class="form-group">
							<label>Teléfono 2</label>
							<input class="form-control dson" type="text" name="phone2" value="{{ Auth::guard('customer')->user()->phone2 }}">
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group">
							<label>Dirección</label>
							<input class="form-control dson" type="text" name="address" value="{{ Auth::guard('customer')->user()->address }}" required>
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group">
							<label>Código Postal</label>
							<input class="form-control dson" type="text" name="cp" value="{{ Auth::guard('customer')->user()->cp }}" required>
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group">
							<label>Provincia</label>
							{!! Form::select('geoprov_id', $geoprovs, Auth::guard('customer')->user()->geoprov_id,
							['class' => 'GeoProvSelect form-control dson', 'placeholder' => 'Seleccione una opción']) !!}
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group">
							<label>Localidad</label>
							@if(Auth::guard('customer')->user()->geoloc)
							<select id='GeoLocsSelect' name="geoloc_id" 
								data-actualloc="{{ Auth::guard('customer')->user()->geoloc->name }}" 
								data-actuallocid="{{ Auth::guard('customer')->user()->geoloc->id }}" 
								class="form-control GeoLocsSelect dson" required>
							</select>
							@else
							<select id='GeoLocsSelect' name="geoloc_id" 
								data-actualloc="" 
								data-actuallocid="" 
								class="form-control GeoLocsSelect dson" required>
							</select>
							@endif
						</div>
					</div>
					@if(Auth::guard('customer')->user()->group == '3') 
						<div class="col-sm-4">
							<div class="form-group">
								<label>Tipo de Negocio</label>
								{!! Form::select('business_type', ['Local' => 'Local', 'ShowRoom' => 'ShowRoom', 'Revendedora' => 'Revendedora'], null,
								['class' => 'form-control', 'placeholder' => 'Seleccione una opción', 'required' => '']) !!}
							</div>
						</div>
						<div class="col-sm-4">
							<div class="form-group">
								<label>CUIT</label>
								<input class="form-control dson" type="text" name="cuit" value="{{ Auth::guard('customer')->user()->cuit }}" placeholder="Ingrese su número de CUIT"/>
							</div>
						</div>
						<div class="col-sm-4">
							<div class="form-group">
								<label>DNI</label>
								<input class="form-control dson" type="text" name="dni" value="{{ Auth::guard('customer')->user()->dni }}" placeholder="Ingrese su número de DNI"/>
							</div>
						</div>
					@endif
				</div><br>
				{{-- <div class="row">
					<div class="col-md-12">
						<div class="sub-title">¿ Tenés un cupón de descuento ?</div>
						<div class="form-group small-form">
							@if($activeCart['orderDiscount'] > 0)
								<div class="coupon-message">
									<div class="inner">
										<span class="small">Esta compra cuenta con un</span><br>
										<span class="big">% {{ $activeCart['rawdata']->order_discount }} de descuento !</span>
									</div>
								</div>
							@else
								<div id="CouponDiv">
									<label for="">Ingresá el código de tu cupón</label>
									<input id="CuponCodeInput" class="form-control mw-200" type="" name="coupon_id" value="">
									<div class="button-and-loader">
										<button id="CheckCoupon" type="button" class="btn btn-primary">Ingresar</button>
										<div class="CouponLoader Hidden"><img src="{{ asset('images/gral/loader-sm.svg') }}" alt=""> Validando...</div>
										<div id="CouponValidationMessage"></div>
									</div>
								</div>
								<div id="SettedCoupon" class="coupon-message Hidden">
									<div class="inner">
										<span class="big">Cupón válido !</span>
									</div>
								</div>
							@endif
						</div>
					</div>
				</div> --}}
			</div>{{-- / col-sm-8 --}}
			{{-- Checkout Sidebar --}}
			<div class="col-sm-4">
				@include('store.partials.checkout-aside')
			</div>
			{!! Form::close() !!} 
		</div>
		{{-- <div class="container">
			<div class="text-right"><a href="{{ url('checkout-final') }}" class="btn main-btn">Continuar</a></div>
			<div class="back-to-store"><a href="{{ url('tienda') }}"><i class="icon-arrow-left"></i> Volver a la tienda</a></div>
		</div> --}}
	</div> {{-- / Container --}}
	<div id="Error"></div>
@endsection

@section('scripts')
	@include('store.components.bladejs')
@endsection
