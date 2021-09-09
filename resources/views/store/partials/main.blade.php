<!DOCTYPE html>
<html lang="es">
	<head>
		<meta charset="utf-8">
		<title>Venta online de indumentaria femenina mayorista | Nolita</title>
		<!-- SEO Meta Tags-->
		<meta name="description" content="Tienda oficial de Nolita.   Venta online mayorista de indumentaria femenina.  Envíos a todo el país.  Registrate y hacé tu pedido online.">
		<meta name="keywords" content="nolita, indumentaria, ropa, vestidos, ropa interior, lenceria, bombachas, tangas">
		<meta name="author" content="Vimana Studio">
		<meta name="csrf-token" content="{{ csrf_token() }}">
		<!-- Mobile Specific Meta Tag-->
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
		<!-- Favicon and Apple Icons-->
		{{--  <link rel="icon" type="image/x-icon" href="favicon.ico">  --}}
		<link rel="icon" type="image/png" href="{{ asset('images/web/favicon-152x152.png') }}">
		<link rel="apple-touch-icon" href="{{ asset('images/web/favicon-152x152.png') }}">
		<link rel="apple-touch-icon" sizes="152x152" href="{{ asset('images/web/favicon-152x152.png') }}">
		<link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/web/favicon-182x180.png') }}">
		<link rel="apple-touch-icon" sizes="167x167" href="{{ asset('images/web/favicon-167x167.png') }}">
		<!-- Vendor Styles including: Bootstrap, Font Icons, Plugins, etc.-->
		<link rel="stylesheet" media="screen" href="{{ asset('store-ui/css/vendor.min.css') }}">
		<link rel="stylesheet" media="screen" href="{{ asset('store-ui/css/iziToast.min.css') }}">
		<link rel="stylesheet" href="{{ asset('plugins/font-awesome/css/all.css') }}">
		<!-- Main Template Styles-->
		<link rel="stylesheet" media="screen" href="{{ asset('css/store-custom.css') }}">
		@yield('styles')
		<!-- Modernizr-->
		<script src="{{ asset('store-ui/js/modernizr.min.js') }}"></script>
		{!! $google_analytics !!}

		@yield('meta')

		<link rel="canonical" href="https://www.nolita.com.ar/"/>
		
		<!-- Facebook Pixel Code -->
		<script>
			!function(f,b,e,v,n,t,s)
			{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
			n.callMethod.apply(n,arguments):n.queue.push(arguments)};
			if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
			n.queue=[];t=b.createElement(e);t.async=!0;
			t.src=v;s=b.getElementsByTagName(e)[0];
			s.parentNode.insertBefore(t,s)}(window, document,'script',
			'https://connect.facebook.net/en_US/fbevents.js');
			fbq('init', '1002215936641276');
			fbq('track', 'PageView');
			fbq('track', 'ViewContent');
		</script>	
		<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1002215936641276&ev=PageView&noscript=1"/></noscript>
		
		<!-- End Facebook Pixel Code -->
		<!-- Google Tag Manager -->
		<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
		new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
		j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
		'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
		})(window,document,'script','dataLayer','GTM-WCPHT5V');</script>
		<!-- End Google Tag Manager -->
	</head>
	<!-- Body-->
	<body>
		<!-- Google Tag Manager (noscript) -->
		<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WCPHT5V"
			height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
			<!-- End Google Tag Manager (noscript) -->
		<div class="main-wrapper">
			{{-- <div id="MainOverlay" class="main-overlay"></div> --}}
			<div id="full-loader" class="full-loader Hidden">
				<div class="inner">
					<img src="{{ asset('store-ui/images/loader.gif') }}" alt="Loader">
				</div>
			</div>
			
			@yield('modal')
			@include('store.partials.topbar')
			@include('store.partials.nav') {{-- ToolBar is inside this nav include --}}
			@include('store.partials.alerts')
			
			{{-- Checkout Sidebar --}}
			@include('store.partials.cart-sidebar')
			<div class="container-fluid custom-page-title pad0"> @yield('header-image') </div>
			
			{{-- Site Content --}}
			<div class="content"> @yield('content') </div>
		</div>	

		<div class="store-footer container-fluid">
			<div class="row">
				<div class="container">
					<ul>								
						<li><a class="data-top-desktop" href="mailto:venta@augustamoi.com"><i class="icon-mail"></i>&nbsp; info@nolita.com.ar</a></li>
						<li><a class="data-top-desktop" href="https://wa.me/5491124906000" target="_blank"><i class="fab fa-whatsapp"></i>&nbsp; 11-2490-6000 </a></li>
						<li><a href="#">Solo venta Online</a></li>
						{{-- <li><span class="data-top-desktop"> <i class="fa fa-home"></i> Showroom: Allende 3464. Villa Devoto. Cita previa por WhatsApp</span></li> --}}
					</ul>
				</div>
			</div>
		</div>
		<!-- Site Footer-->
		<footer class="site-footer">
			<div class="container">
				<p class="footer-copyright">
					© {{ date('Y') }} - Desarrollado por <a href="https://vimanastudio.com.ar" target="_blank">&nbsp; Vimana Studio </a>
				</p>
			</div>
		</footer>

		{{-- Whats App Cta --}}
		<div class="floating-bottom-cta">
			<div class="inner">
				<a href="https://wa.me/5491124906000" target="_blank"><i class="fab fa-whatsapp"></i></a>
			</div>
		</div>
	
		{{-- Back To Top Button --}}
		<a class="scroll-to-top-btn" href="#"> <i class="icon-arrow-up"></i> </a>

		{{-- Backdrop --}}
		<div class="site-backdrop"></div>

		{{-- JavaScript (jQuery) libraries, vendor and custom scripts --}}
		<script src="{{ asset('store-ui/js/vendor.min.js') }}"></script>
		<script src="{{ asset('store-ui/js/iziToast.min.js') }}"></script>
		<script src="{{ asset('store-ui/js/scripts.min.js') }}"></script>
		<script src="{{ asset('plugins/jquery/jquery-3.3.1.min.js') }}"></script>
		<script type='text/javascript' src='//cdn.jsdelivr.net/jquery.marquee/1.4.0/jquery.marquee.min.js'></script>
		<script src="{{ asset('js/scripts.js') }}"></script>
		@include('store.partials.scripts')
		@yield('scripts')
		@if(isset($_GET['checkout-on']))
			<script>
				checkoutSidebar('show');
			</script>
		@endif
			<!-- Facebook Pixel Code -->
	<!-- Facebook Pixel Code -->
	<!-- Facebook Pixel Code -->
	<script>
		!function(f,b,e,v,n,t,s)
		{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
		n.callMethod.apply(n,arguments):n.queue.push(arguments)};
		if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
		n.queue=[];t=b.createElement(e);t.async=!0;
		t.src=v;s=b.getElementsByTagName(e)[0];
		s.parentNode.insertBefore(t,s)}(window, document,'script',
		'https://connect.facebook.net/en_US/fbevents.js');
		fbq('init', '2268507203269857');
		fbq('track', 'PageView');
	</script>
	<noscript><img height="1" width="1" style="display:none"
		src="https://www.facebook.com/tr?id=2268507203269857&ev=PageView&noscript=1"
	/></noscript>
	<!-- End Facebook Pixel Code -->

	<script type="text/javascript">var subscribersSiteId='7d6e1b8a-5c74-498bb968-a733183b514e';</script><script type="text/javascript" src="https://cdn.subscribers.com/assets/subscribers.js"></script>
	</body>
</html>





