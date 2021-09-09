<?php

Auth::routes();

Route::get('test', function(){ return view('store.checkout-success'); });

/*
|--------------------------------------------------------------------------
| STORE LOGIN / REGISTER :: ROUTES
|--------------------------------------------------------------------------
*/
Route::group(['prefix'=> 'tienda', 'middleware' => 'active-customer'], function() {   
    // Store Login
    Route::get('login', ['as' => 'customer.login', 'uses' => 'CustomerAuth\LoginController@showLoginForm']);
    Route::post('login', ['uses' => 'CustomerAuth\LoginController@login']);
    Route::post('logout', ['as' => 'customer.logout', 'uses' => 'CustomerAuth\LoginController@logout']);
    // Store Registration Routes
    
    // Route::get('registro', function(){ return view('store.register-select'); });
    Route::get('registro', ['as' => 'customer.register', 'uses' => 'CustomerAuth\RegisterController@showRegistrationForm']);
    // Route::get('register-reseller', ['as' => 'customer.register-reseller', 'uses' => 'CustomerAuth\RegisterController@showRegistrationFormReseller']);
    Route::post('register', ['as' => 'customer.process-register','uses' => 'CustomerAuth\RegisterController@register']);
    // Route::post('register', function(){ dd("Test"); });
    // Store Password Reset Routes
    Route::get('password/reset', ['as' => 'customer.password.reset', 'uses' => 'CustomerAuth\ForgotPasswordController@showLinkRequestForm']);
    Route::post('password/email', ['as' => 'customer.password.email', 'uses' => 'CustomerAuth\ForgotPasswordController@sendResetLinkEmail']);
    Route::post('password/reset', ['uses' => 'CustomerAuth\ResetPasswordController@reset']);
    Route::get('password/reset/{token}', ['as' => 'customer.password.reset.token', 'uses' => 'CustomerAuth\ResetPasswordController@showResetForm']);
});

// After

Route::get('registro-completo', function(){ return view('store.register-success'); })->middleware('active-customer');
Route::get('registro-en-proceso', function(){ return view('store.register-in-process'); })->middleware('active-customer');

/*
|--------------------------------------------------------------------------
| VADMIN LOGIN / REGISTER :: ROUTES
|--------------------------------------------------------------------------
*/
Route::group(['prefix'=> 'vadmin'], function() {
    // Login Routes
    Route::get('login', ['as' => 'vadmin.login', 'uses' => 'Auth\LoginController@showLoginForm']);
    Route::post('login', ['uses' => 'Auth\LoginController@login']);
    Route::post('logout', ['as' => 'vadmin.logout', 'uses' => 'Auth\LoginController@logout']);
    
    // Registration Routes
    Route::get('register', ['as' => 'vadmin.register', 'uses' => 'Auth\RegisterController@showRegistrationForm']);
    Route::post('register', ['uses' => 'Auth\RegisterController@register']);
    
    // Password Reset Routes
    Route::get('password/reset', ['as' => 'vadmin.password.reset', 'uses' => 'Auth\ForgotPasswordController@showLinkRequestForm']);
    Route::post('password/email', ['as' => 'vadmin.password.email', 'uses' => 'Auth\ForgotPasswordController@sendResetLinkEmail']);
    Route::get('password/reset/{token}', ['as' => 'vadmin.password.reset.token', 'uses' => 'Auth\ResetPasswordController@showResetForm']);
    Route::post('password/reset', ['uses' => 'Auth\ResetPasswordController@reset']);
});

/*
|--------------------------------------------------------------------------
| Web
|--------------------------------------------------------------------------
|
*/

// If has front web
// Route::get('/', ['as' => 'web', 'uses' => 'WebController@home']);

// If has only e-shop
Route::get('/', ['as' => 'store', 'uses' => 'Store\StoreController@index'])->middleware('active-customer');

/*
|--------------------------------------------------------------------------
| Web / Portfolio 
|--------------------------------------------------------------------------
*/

Route::get('portfolio', ['as'   => 'web.portfolio',	'uses' => 'WebController@portfolio']);
// Show Article / Catalogue
Route::get('article/{slug}', ['as' => 'web.portfolio.article', 'uses' => 'WebController@showWithSlug'])->where('slug', '[\w\d\-\_]+');
// Article Searcher
Route::get('categories/{name}', ['as' => 'web.search.category', 'uses' => 'WebController@searchCategory']);
Route::get('tag/{name}', ['as' => 'web.search.tag', 'uses' => 'WebController@searchTag']);
Route::post('mail_sender', 'WebController@mail_sender');

/*
|--------------------------------------------------------------------------
| Store
|--------------------------------------------------------------------------
*/
// Route::get('/', 'Store\StoreController@index')->middleware('active-customer');
Route::get('tienda', ['as' => 'store', 'uses' => 'Store\StoreController@index'])->middleware('active-customer');
Route::get('terminos-y-condiciones', function(){ return view('store.section1'); });
Route::get('medidas', function(){ return view('store.section2'); });
Route::get('condiciones-de-compra', function(){ return view('store.buy-conditions'); });
Route::get('como-comprar', function(){ return view('store.how-to-buy'); });

// Searchs
Route::get('tienda/talle/{name}', ['as' => 'store.search.size', 'uses' => 'Store\StoreController@searchSize']);
Route::get('tienda/etiqueta/{name}', ['as' => 'store.search.tag', 'uses' => 'Store\StoreController@searchTag']);

Route::group(['prefix'=> 'tienda', 'middleware' => 'active-customer'], function() {    
    Route::get('articulo/{id}', 'Store\StoreController@show');
    
    // Customer Actions
    Route::group(['middleware'=> 'customer'], function() {
        // User Avatar
        Route::post('updateCustomerAvatar', 'CustomerController@updateCustomerAvatar');
        // Cart
        Route::post('addtocart', ['as' => 'store.addtocart', 'uses' => 'Store\CartItemController@store']);
        Route::get('checkVariantStock', 'Store\StoreController@checkVariantStock');
        Route::post('addToCartLive', ['as' => 'store.addToCartLive', 'uses' => 'Store\CartItemController@store']);
        Route::post('addQtoCart', ['as' => 'store.addQtoCartItem', 'uses' => 'Store\CartItemController@addQtoCartItem']);
        Route::post('removeFromCart', ['as' => 'store.removeFromCart', 'uses' => 'Store\CartItemController@destroy']);
        Route::post('removeFromCartLive', ['as' => 'store.removeFromCartLive', 'uses' => 'Store\CartItemController@liveDestroy']);
        
        Route::post('eliminar-carro', ['as' => 'store.removeCartReturnStock', 'uses' => 'Store\CartsController@removeCartReturnStock']);
        // Sections    
        Route::get('cuenta', ['as' => 'store.customer-account', 'uses' => 'Store\StoreController@customerAccount']);
        Route::get('favoritos', ['as' => 'store.customer-wishlist', 'uses' => 'Store\StoreController@customerWishlist']);
        Route::get('pedidos', ['as' => 'store.customer-orders', 'uses' => 'Store\StoreController@customerOrders']);
        Route::get('pedido', ['as' => 'store.customerOrder', 'uses' => 'Store\StoreController@customerCartItem']);
        // Customers
        Route::post('updateCustomer', ['as' => 'store.updateCustomer', 'uses' => 'Store\CustomerController@update']);
        Route::get('updatePassword', ['as' => 'store.updatePassword', 'uses' => 'Store\StoreController@updatePassword']);
        Route::post('updatePassword', ['as' => 'store.updatePassword', 'uses' => 'Store\CustomerController@updatePassword']);

        // Checkout
        // ===============
        // Go to Review Items
        Route::get('checkout', ['as' => 'store.checkout', 'uses' => 'Store\StoreController@checkoutItems']);
        // Review Items
        Route::post('checkout-items', ['as' => 'store.checkout-set-items', 'uses' => 'Store\StoreController@checkoutSetItems']);
        // Go to Checkout Last
        Route::get('finalizando-compra', ['as' => 'store.checkoutLast', 'uses' => 'Store\StoreController@checkoutLast']);
        // Process Checkout
        Route::post('finalizando-compra', ['as' => 'store.processCheckout', 'uses' => 'Store\StoreController@processCheckout']);
        // Update Cart Payment and Shipping Methods
        Route::post('updateCartPayment', ['as' => 'store.updatePaymentAndShipping', 'uses' => 'Store\CartsController@updatePaymentAndShipping']);
        // Check discount coupon
        Route::post('checkear-cupon', ['as' => 'store.validateAndSetCoupon', 'uses' => 'Store\StoreController@validateAndSetCoupon']);
        // Get Invoice
        Route::get('descargar-comprobante/{id}/{action}', 'Store\StoreController@downloadInvoice');
        // Online Payments Api
        Route::post('mp-connect', ['as' => 'store.getCreatePreference', 'uses' => 'Store\StoreController@mpConnect']);
        // Route::post('mp-connect', ['as' => 'store.getCreatePreference', 'uses' => 'MercadoPagoController@getCreatePreference']);
    });
    
    Route::post('addArticleToFavs', ['as' => 'customer.addArticleToFavs', 'uses' => 'Store\StoreController@addArticleToFavs']);
    Route::post('removeArticleFromFavs', ['as' => 'customer.removeArticleFromFavs', 'uses' => 'Store\StoreController@removeArticleFromFavs']);
    Route::post('removeAllArticlesFromFavs', ['as' => 'customer.removeAllArticlesFromFavs', 'uses' => 'Store\StoreController@removeAllArticlesFromFavs']);
});


/*
|--------------------------------------------------------------------------
| Vadmin - Sections
|--------------------------------------------------------------------------
*/

// Functions that all users can access
Route::group(['prefix' => 'vadmin', 'middleware' => 'active-user'], function(){
    
    Route::get('/', 'VadminController@index');

    Route::get('configuracion', ['as' => 'vadmin.settings', 'uses' => 'VadminController@settings']);

    Route::post('sendMail', ['as' => 'vadmin.sendMail', 'uses' => 'VadminController@sendMail']);
    Route::post('sendSupportMail', ['as' => 'vadmin.sendSupportMail', 'uses' => 'VadminController@sendSupportMail']);

    Route::post('updateAvatar', 'UserController@updateAvatar');
    Route::post('updateCustomerAvatar', 'CustomerController@updateCustomerAvatar');

    // Orders
    Route::post('removeFromOrder', ['as' => 'vadmin.removeFromOrder', 'uses' => 'Store\OrdersController@destroy']);
    
    // Route::post('actualizar-avatar', ['as' => 'vadmin.updateCustomerAvatar', 'uses' => 'CustomerController@updateCustomerAvatar']);
    // Exports
    Route::get('exportViewPdf/{view}/{params}/{model}/{filename}', ['as' => 'vadmin.exportViewPdf', 'uses' => 'invoiceController@exportViewPdf']);
    // Export Users
    Route::get('exportUsersListPdf/{params}', ['as' => 'vadmin.exportUsersListPdf', 'uses' => 'UserController@exportPdf']);
    Route::get('exportUsersListXls/{params}', ['as' => 'vadmin.exportUsersListXls', 'uses' => 'UserController@exportXls']);
    // Export Customers
    Route::get('exportCustomersListPdf/{params}/{action}', ['as' => 'vadmin.exportCustomersListPdf', 'uses' => 'CustomerController@exportPdf']);
    Route::get('exportCustomersListSheet/{params}/{format}', ['as' => 'vadmin.exportCustomersListSheet', 'uses' => 'CustomerController@exportSheet']);
    Route::get('exportAllCustomersSheet', ['as' => 'vadmin.exportAllCustomersSheet', 'uses' => 'CustomerController@exportByPeriod']);
    
    Route::get('exportCustomersForGmail', ['as' => 'vadmin.exportForGmail', 'uses' => 'CustomerController@exportForGmail']);
    Route::get('exportSleepCustomers', ['as' => 'vadmin.exportSleepCustomers', 'uses' => 'CustomerController@exportSleepCustomers']);
    Route::get('exportCustomersOrders', ['as' => 'vadmin.exportCustomersOrders', 'uses' => 'CustomerController@exportCustomersOrders']);
    
    
    // Export Catalog List
    Route::get('exportCatalogListPdf/{params}/{action}', ['as' => 'vadmin.exportCatalogListPdf', 'uses' => 'Catalog\ArticlesController@exportPdf']);
    Route::get('exportCatalogListSheet/{params}/{format}', ['as' => 'vadmin.exportCatalogListSheet', 'uses' => 'Catalog\ArticlesController@exportSheet']);
    // Export Orders
    Route::get('exportOrderCsv/{params}', ['as' => 'vadmin.exportOrderCsv', 'uses' => 'Store\OrdersController@exportOrderCsv']);
    Route::get('exportOrderXls/{params}', ['as' => 'vadmin.exportOrderXls', 'uses' => 'Store\OrdersController@exportOrderXls']);
    
    Route::get('mailChecker', ['as' => 'vadmin.mailChecker', 'uses' => 'ToolsController@mailChecker']);
    // Autocomplete
    Route::get('search', ['as' => 'search', 'uses' => 'VadminController@searchData']);

    // -- SUPPORT --
    Route::get('docs', function(){ return view('vadmin.support.docs'); });
    Route::get('help', function(){ return view('vadmin.support.help'); });

    // -- TESTS --
    Route::get('tests', ['as' => 'vadmin.tests', 'uses' => 'VadminTestsController@tests']);
    Route::post('testMailSending', ['as' => 'vadmin.testMailSending', 'uses' => 'VadminTestsController@testMailSending']);
    Route::post('testImageUpload', ['as' => 'vadmin.testImageUpload', 'uses' => 'VadminTestsController@testImageUpload']);
});


// Admin and SuperAdmin Only
Route::group(['prefix' => 'vadmin', 'middleware' => ['active-user', 'admin']], function(){
    
    Route::post('actualizar-opciones', ['as' => 'updateSettings', 'uses' => 'VadminController@updateSettings']);
    
    Route::get('panel-de-control', ['as' => 'storeControlPanel', 'uses' => 'VadminController@storeControlPanel']);
    
    Route::post('updateStatus/{model}/{id}', 'VadminController@updateStatus');
    Route::post('updateStatusMultiple/{id}/{model}/{status}', 'VadminController@updateStatusMultiple');
    
    // -- USERS --
    Route::resource('users', 'UserController');
    Route::post('message_status/{id}', 'VadminController@updateMessageStatus');
    
    // -- CUSTOMERS --
    Route::resource('customers', 'CustomerController');
    Route::post('updateCustomerGroup', 'CustomerController@updateCustomerGroup');
    
    // -- MESSAGES --
    Route::get('/mensajes_recibidos/{status}', 'VadminController@storedContacts');
    Route::post('buscar_mensajes_recibidos', ['as' => 'searchStoredContact', 'uses' => 'VadminController@searchStoredContact']);
    Route::get('mensajes_recibidos/{id}', 'VadminController@showStoredContact');
    Route::post('setMessageAsReaded', 'VadminController@setMessageAsReaded');
    
    // -- PORTFOLIO --
    Route::resource('portfolio', 'Portfolio\ArticlesController');
    Route::resource('categories', 'Portfolio\CategoriesController');
    Route::resource('tags', 'Portfolio\TagsController');
    Route::post('deleteArticleImg/{id}', 'Portfolio\ArticlesController@deleteArticleImg');
    
    // -- CATALOG --
    Route::resource('catalogo', 'Catalog\ArticlesController');
    Route::post('catalog_store_validation', ['as' => 'vadmin.catalog_store_validation', 'uses' => 'Catalog\ArticlesController@storeValidation']);
    Route::patch('catalog_update_validation', ['as' => 'vadmin.catalog_update_validation', 'uses' => 'Catalog\ArticlesController@updateValidation']);
    
    Route::get('createFromAnother/{model}/{id}', 'Catalog\ArticlesController@createFromAnother');
    Route::post('update_catalog_field', 'Catalog\ArticlesController@updateField');
    Route::post('update_catalog_fields', ['as' => 'vadmin.update_catalog_fields', 'uses' => 'Catalog\ArticlesController@updateFields']);
    // Route::post('update_catalog_fields', 'Catalog\ArticlesController@updateFields');
    // Categories
    Route::resource('cat_categorias', 'Catalog\CategoriesController');
    Route::resource('cat_tags', 'Catalog\TagsController');
    Route::post('cat_article_status/{id}', 'Catalog\ArticlesController@updateStatus');
    Route::post('deleteArticleImg/{id}', 'Portfolio\ArticlesController@deleteArticleImg');
    // Sizes
    Route::resource('cat_sizes', 'Catalog\CatalogSizeController');
    Route::post('update_cat_size_field', 'Catalog\CatalogSizeController@updateField');
    // Colors
    Route::resource('cat_colors', 'Catalog\ColorController');
    Route::post('update_cat_color_field', 'Catalog\ColorController@updateField');
    // Seasons
    Route::resource('cat_brands', 'Catalog\BrandController');
    Route::post('update_cat_brand_field', 'Catalog\BrandController@updateField');
    // CatalogArticle Images
    Route::post('catalog_make_thumb/{id}', 'Catalog\ArticlesController@makeThumb');
    Route::get('article/{id}/images/setFeatured/{image}', 'Catalog\ImagesController@setFeatured');
    // Shipping
    Route::resource('shippings', 'Catalog\ShippingsController');
    // Payments Methods
    Route::resource('payments', 'Catalog\PaymentsController');
    // Coupons
    Route::resource('coupons', 'Catalog\CouponController');
    Route::post('generateCatalogCoupon', 'Catalog\CouponController@generateCatalogCoupon');
    Route::post('updateCartStatus', 'Store\CartsController@updateStatus');
    // Carts (Orders) Management
    Route::resource('orders', 'Store\OrdersController');
    Route::get('descargar-comprobante/{id}/{action}', 'Store\OrdersController@downloadInvoice');
    Route::get('super-vadmin', 'VadminController@superVadmin');
    
    
    Route::get('searchCatalogArticle', ['as' => 'vadmin.searchCatalogArticle', 'uses' => 'AutocompleteController@searchCatalogArticle']);
    Route::get('searchCustomer', ['as' => 'vadmin.searchCustomer', 'uses' => 'AutocompleteController@searchCustomer']);

    Route::get('jobs_logs', 'JobsController@index'); 

});

/*
|--------------------------------------------------------------------------
| Shared Functions
|--------------------------------------------------------------------------
*/

// Get Localities
Route::get('getGeoLocs/{id}', 'SharedController@getGeoLocs');

/*
|--------------------------------------------------------------------------
| Destroy
|--------------------------------------------------------------------------
*/

Route::prefix('vadmin')->middleware('admin')->group(function () {
    Route::post('destroy_users', 'UserController@destroy');
    Route::post('destroy_customers', 'CustomerController@destroy');
    Route::post('destroy_portfolio', 'Portfolio\ArticlesController@destroy');
    Route::post('destroy_categories', 'Portfolio\CategoriesController@destroy');
    Route::post('destroy_tags', 'Portfolio\TagsController@destroy');
    Route::post('destroy_catalogo', 'Catalog\ArticlesController@destroy');
    Route::post('destroy_cat_categorias', 'Catalog\CategoriesController@destroy');
    Route::post('destroy_coupons', 'Catalog\CouponController@destroy');
    Route::post('destroy_cat_colors', 'Catalog\ColorController@destroy');
    Route::post('destroy_cat_brands', 'Catalog\BrandController@destroy');
    Route::post('destroy_cat_tags', 'Catalog\TagsController@destroy');
    Route::post('destroy_cat_variant', 'Catalog\VariantsController@destroy');
    Route::post('destroy_stored_contacts', 'VadminController@destroyStoredContacts');
    Route::post('destroy_cat_sizes', 'Catalog\CatalogSizeController@destroy');
    Route::post('destroy_product_image', 'Catalog\ImagesController@destroy');
    Route::post('destroy_portfolio_image', 'Portfolio\ImagesController@destroy');
    Route::post('destroy_shippings', 'Catalog\ShippingsController@destroy');
    Route::post('destroy_payments', 'Catalog\PaymentsController@destroy');
    Route::post('destroy_carts', 'Store\CartsController@destroy');
    Route::post('destroy_orders', 'Store\CartsController@destroy');
    Route::post('destroy_cartitem', 'Store\CartsController@destroy');
});


/*
|--------------------------------------------------------------------------
| Errors
|--------------------------------------------------------------------------
*/
Route::get('404', ['as' => '404', 'uses' => 'ErrorController@notfound']);
Route::get('500', ['as' => '500', 'uses' => 'ErrorController@fatal']);

/*
|--------------------------------------------------------------------------
| API Passport
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| DEV
|--------------------------------------------------------------------------
*/

Route::get('/vadmin/dev', 'VadminTestsController@devZone');
Route::get('/vadmin/deleted-cart-log', 'VadminTestsController@deletedCartsLog');
// Route::get('checkout-success-test', function(){
//     return view('store.checkout-success');
// });

// Route::get('/vadmin/clients', function(){
//     return view('vadmin.dev.clients');
// });
//->middleware('auth');

// Render Mails Test
//use App\Cart;
//Route::get('/mail', function(){
//    $cart = Cart::findOrFail(29);  
//    $message = 'Mensaje de dfdfhsdjkf';
//    // Bussiness
//    return new App\Mail\SendMail('Subject', 'SimpleMail', $message);
//    // Customer
//    //return new App\Mail\SendMail('Nolita | Compra recibida !', 'CustomerCheckout', $cart);
//});


