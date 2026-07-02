<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductTagController;
use App\Http\Controllers\ProductColorController;
use App\Http\Controllers\ProductSizeController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\DeliveryMethodController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AutopostController;
use App\Http\Controllers\SystemSettingsController;
use App\Http\Controllers\ImageSettingsController;
use App\Http\Controllers\ShopConfigurationController;
use App\Http\Controllers\NewsletterPopupConfigController;
use App\Http\Controllers\NewsletterSubscriberController;
use App\Http\Controllers\Api\NotificationPreferenceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Admin\ProvinceController;
use App\Http\Controllers\Api\Admin\LocalityController;
use App\Http\Controllers\Api\Admin\CustomerExportController;
use App\Http\Controllers\Api\Admin\OrderDocumentExportController;
use App\Http\Controllers\Api\Admin\OrderExportController;
use App\Http\Controllers\Api\Admin\StatisticsController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\PasswordResetController;

Route::post('/password/email', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/password/reset', [PasswordResetController::class, 'reset']);

Route::post('/login', [AuthController::class, 'login']);


Route::get('/public/articles', [PostController::class, 'publicIndex']);
Route::get('/public/articles/{slug}', [PostController::class, 'publicShow']);
Route::get('/public/categories', [CategoryController::class, 'publicIndex']);
Route::get('/public/tags', [TagController::class, 'publicIndex']);
Route::get('/public/products', [ProductController::class, 'publicIndex']);
Route::get('/public/products/{slug}', [ProductController::class, 'publicShow']);
Route::get('/public/product-categories', [ProductCategoryController::class, 'publicIndex']);
Route::get('/public/product-tags', [ProductTagController::class, 'publicIndex']);
Route::get('/public/business-info', [SystemSettingsController::class, 'publicInfo']);
Route::get('/public/site-content', [\App\Http\Controllers\SiteContentController::class, 'publicIndex']);
Route::post('/public/contact', [ContactController::class, 'store']);

Route::get('/public/shop-configuration', [ShopConfigurationController::class, 'publicInfo']);

Route::get('/public/newsletter/popup-config', [NewsletterPopupConfigController::class, 'publicInfo']);
Route::post('/public/newsletter/subscribe', [NewsletterSubscriberController::class, 'subscribe']);

Route::get('/system-settings', [SystemSettingsController::class, 'index']);
Route::get('/system-settings/{key}', [SystemSettingsController::class, 'show']);

// Public routes for checkout
Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
Route::get('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'show']);
Route::get('/delivery-methods', [DeliveryMethodController::class, 'index']);

// Public geographic data
Route::get('/provinces', [ProvinceController::class, 'index']);
Route::get('/localities', [LocalityController::class, 'index']);
Route::get('/delivery-methods/{deliveryMethod}', [DeliveryMethodController::class, 'show']);
Route::post('/checkout', [App\Http\Controllers\Api\OrderController::class, 'checkout']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [AuthController::class, 'dashboard']);
    Route::get('/user', function (Request $request) {
        return new UserResource($request->user()->load(['roles.permissions', 'media']));
    });

    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);

    Route::get('/users/assignable-roles', [UserController::class, 'assignableRoles'])->middleware('permission:users.view');
    Route::apiResource('users', UserController::class)->middleware('permission:users.view');
    Route::post('/users/{user}/avatar', [UserController::class, 'uploadAvatar']);
    Route::post('/users/bulk-delete', [UserController::class, 'bulkDelete'])->middleware('permission:users.delete');
    Route::apiResource('roles', RoleController::class)->middleware('super_admin');
    Route::post('/roles/bulk-delete', [RoleController::class, 'bulkDelete'])->middleware('super_admin');
    Route::apiResource('permissions', PermissionController::class)->middleware('super_admin');

    Route::get('/categories', [CategoryController::class, 'index'])->middleware('permission:view blog');
    Route::get('/categories/{category}', [CategoryController::class, 'show'])->middleware('permission:view blog');
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('permission:manage categories');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->middleware('permission:manage categories');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:manage categories');
    Route::post('/categories/bulk-delete', [CategoryController::class, 'bulkDelete'])->middleware('permission:manage categories');

    Route::get('/tags', [TagController::class, 'index'])->middleware('permission:view blog');
    Route::get('/tags/{tag}', [TagController::class, 'show'])->middleware('permission:view blog');
    Route::post('/tags', [TagController::class, 'store'])->middleware('permission:manage tags');
    Route::put('/tags/{tag}', [TagController::class, 'update'])->middleware('permission:manage tags');
    Route::delete('/tags/{tag}', [TagController::class, 'destroy'])->middleware('permission:manage tags');
    Route::post('/tags/bulk-delete', [TagController::class, 'bulkDelete'])->middleware('permission:manage tags');

    Route::get('/articles', [PostController::class, 'index'])->middleware('permission:view blog');
    Route::get('/articles/{post}', [PostController::class, 'show'])->middleware('permission:view blog');
    Route::post('/articles', [PostController::class, 'store'])->middleware('permission:manage articles');
    Route::put('/articles/{post}', [PostController::class, 'update'])->middleware('permission:manage articles');
    Route::patch('/articles/{post}', [PostController::class, 'quickUpdate'])->middleware('permission:manage articles');
    Route::delete('/articles/{post}', [PostController::class, 'destroy'])->middleware('permission:manage articles');
    Route::post('/articles/bulk-delete', [PostController::class, 'bulkDelete'])->middleware('permission:delete articles');
    Route::delete('/articles/{post}/gallery/{media}', [PostController::class, 'deleteGalleryImage'])->middleware('permission:manage articles');

    Route::get('/products', [ProductController::class, 'index'])->middleware('permission:view products');
    Route::get('/products/{product}', [ProductController::class, 'show'])->middleware('permission:view products');
    Route::post('/products', [ProductController::class, 'store'])->middleware('permission:manage products');
    Route::put('/products/{product}', [ProductController::class, 'update'])->middleware('permission:manage products');
    Route::patch('/products/{product}/quick-update', [ProductController::class, 'quickUpdate'])->middleware('permission:manage products');
    Route::patch('/products/{product}/variants/{variant}', [ProductController::class, 'updateVariant'])->middleware('permission:manage products');
    Route::post('/products/{product}/regenerate-qr', [ProductController::class, 'regenerateQr'])->middleware('permission:manage products');
    Route::patch('/products/{product}/qr-url', [ProductController::class, 'updateQrUrl'])->middleware('permission:manage products');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->middleware('permission:manage products');
    Route::delete('/products/{product}/gallery/{media}', [ProductController::class, 'deleteGalleryImage'])->middleware('permission:manage products');
    Route::post('/products/bulk-delete', [ProductController::class, 'bulkDelete'])->middleware('permission:delete products');

    Route::post('/product-categories/bulk-delete', [ProductCategoryController::class, 'bulkDelete'])->middleware('permission:manage products');
    Route::get('/product-categories', [ProductCategoryController::class, 'index'])->middleware('permission:view products');
    Route::get('/product-categories/{product_category}', [ProductCategoryController::class, 'show'])->middleware('permission:view products');
    Route::post('/product-categories', [ProductCategoryController::class, 'store'])->middleware('permission:manage products');
    Route::put('/product-categories/{product_category}', [ProductCategoryController::class, 'update'])->middleware('permission:manage products');
    Route::delete('/product-categories/{product_category}', [ProductCategoryController::class, 'destroy'])->middleware('permission:manage products');

    Route::post('/product-tags', [ProductTagController::class, 'store'])->middleware('permission:users.view');
    Route::put('/product-tags/{product_tag}', [ProductTagController::class, 'update'])->middleware('permission:users.view');
    Route::delete('/product-tags/{product_tag}', [ProductTagController::class, 'destroy'])->middleware('permission:users.view');
    Route::post('/product-tags/bulk-delete', [ProductTagController::class, 'bulkDelete'])->middleware('permission:users.view');

    Route::get('/product-tags', [ProductTagController::class, 'index'])->middleware('permission:users.view');
    Route::get('/product-tags/{product_tag}', [ProductTagController::class, 'show'])->middleware('permission:users.view');

    Route::get('/product-colors', [ProductColorController::class, 'index'])->middleware('permission:view products');
    Route::get('/product-colors/{product_color}', [ProductColorController::class, 'show'])->middleware('permission:view products');
    Route::post('/product-colors', [ProductColorController::class, 'store'])->middleware('permission:manage products');
    Route::put('/product-colors/{product_color}', [ProductColorController::class, 'update'])->middleware('permission:manage products');
    Route::delete('/product-colors/{product_color}', [ProductColorController::class, 'destroy'])->middleware('permission:manage products');
    Route::post('/product-colors/bulk-delete', [ProductColorController::class, 'bulkDelete'])->middleware('permission:manage products');

    Route::get('/product-sizes', [ProductSizeController::class, 'index'])->middleware('permission:view products');
    Route::get('/product-sizes/{product_size}', [ProductSizeController::class, 'show'])->middleware('permission:view products');
    Route::post('/product-sizes', [ProductSizeController::class, 'store'])->middleware('permission:manage products');
    Route::put('/product-sizes/{product_size}', [ProductSizeController::class, 'update'])->middleware('permission:manage products');
    Route::delete('/product-sizes/{product_size}', [ProductSizeController::class, 'destroy'])->middleware('permission:manage products');
    Route::post('/product-sizes/bulk-delete', [ProductSizeController::class, 'bulkDelete'])->middleware('permission:manage products');

    Route::get('/coupons', [CouponController::class, 'index'])->middleware('permission:users.view');
    Route::get('/coupons/{coupon}', [CouponController::class, 'show'])->middleware('permission:users.view');
    Route::post('/coupons', [CouponController::class, 'store'])->middleware('permission:users.view');
    Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->middleware('permission:users.view');
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->middleware('permission:users.view');
    Route::post('/coupons/bulk-delete', [CouponController::class, 'bulkDelete'])->middleware('permission:users.view');

    Route::get('/autopost/settings', [AutopostController::class, 'getSettings']);
    Route::put('/autopost/settings', [AutopostController::class, 'updateSettings']);
    Route::post('/autopost/generate', [AutopostController::class, 'generate']);
    Route::post('/autopost/store', [AutopostController::class, 'store']);

    Route::put('/system-settings/{key}', [SystemSettingsController::class, 'update']);
    Route::put('/system-settings', [SystemSettingsController::class, 'bulkUpdate']);

    Route::get('/image-settings', [ImageSettingsController::class, 'index']);
    Route::get('/image-settings/{section}', [ImageSettingsController::class, 'show']);
    Route::post('/image-settings', [ImageSettingsController::class, 'store']);
    Route::put('/image-settings/{imageSetting}', [ImageSettingsController::class, 'update']);
        Route::delete('/image-settings/{imageSetting}', [ImageSettingsController::class, 'destroy']);

        Route::get('/shop-configuration', [ShopConfigurationController::class, 'show'])->middleware('permission:users.view');
        Route::put('/shop-configuration', [ShopConfigurationController::class, 'update'])->middleware('permission:users.view');

        // Newsletter popup configuration
        Route::get('/newsletter-popup-config', [NewsletterPopupConfigController::class, 'show'])->middleware('permission:users.view');
        Route::put('/newsletter-popup-config', [NewsletterPopupConfigController::class, 'update'])->middleware('permission:users.view');

        // Newsletter subscribers CRUD
        Route::get('/newsletter-subscribers', [NewsletterSubscriberController::class, 'index'])->middleware('permission:users.view');
        Route::get('/newsletter-subscribers/{newsletterSubscriber}', [NewsletterSubscriberController::class, 'show'])->middleware('permission:users.view');
        Route::post('/newsletter-subscribers', [NewsletterSubscriberController::class, 'store'])->middleware('permission:users.view');
        Route::put('/newsletter-subscribers/{newsletterSubscriber}', [NewsletterSubscriberController::class, 'update'])->middleware('permission:users.view');
        Route::delete('/newsletter-subscribers/{newsletterSubscriber}', [NewsletterSubscriberController::class, 'destroy'])->middleware('permission:users.view');
        Route::post('/newsletter-subscribers/bulk-delete', [NewsletterSubscriberController::class, 'bulkDelete'])->middleware('permission:users.view');

        // Customers
    Route::get('admin/customers/export', [CustomerExportController::class, 'registered'])->middleware('permission:users.view');
    Route::post('admin/customers/bulk-delete', [\App\Http\Controllers\Api\Admin\CustomerController::class, 'bulkDelete'])->middleware('permission:users.view');
    Route::post('admin/customers/{customer}/avatar', [\App\Http\Controllers\Api\Admin\CustomerController::class, 'uploadAvatar'])->middleware('permission:users.view');
    Route::apiResource('admin/customers', \App\Http\Controllers\Api\Admin\CustomerController::class)->middleware('permission:users.view');

    // Guest Customers (anonymous order buyers)
    Route::get('admin/guest-customers/export', [CustomerExportController::class, 'guests'])->middleware('permission:users.view');
    Route::post('admin/guest-customers/bulk-delete', [\App\Http\Controllers\Api\Admin\GuestCustomerController::class, 'bulkDelete'])->middleware('permission:users.view');
    Route::get('admin/guest-customers', [\App\Http\Controllers\Api\Admin\GuestCustomerController::class, 'index'])->middleware('permission:users.view');
    Route::get('admin/guest-customers/{guestCustomer}', [\App\Http\Controllers\Api\Admin\GuestCustomerController::class, 'show'])->middleware('permission:users.view');
    Route::delete('admin/guest-customers/{guestCustomer}', [\App\Http\Controllers\Api\Admin\GuestCustomerController::class, 'destroy'])->middleware('permission:users.view');

    // Provinces & Localities
    Route::get('admin/provinces', [ProvinceController::class, 'index'])->middleware('permission:users.view');
    Route::get('admin/provinces/{province}', [ProvinceController::class, 'show'])->middleware('permission:users.view');
    Route::post('admin/provinces', [ProvinceController::class, 'store'])->middleware('permission:users.view');
    Route::put('admin/provinces/{province}', [ProvinceController::class, 'update'])->middleware('permission:users.view');
    Route::delete('admin/provinces/{province}', [ProvinceController::class, 'destroy'])->middleware('permission:users.view');
    Route::post('admin/provinces/bulk-delete', [ProvinceController::class, 'bulkDelete'])->middleware('permission:users.view');
    Route::get('admin/localities', [LocalityController::class, 'index'])->middleware('permission:users.view');
    Route::post('admin/localities/bulk-delete', [LocalityController::class, 'bulkDelete'])->middleware('permission:users.view');
    Route::apiResource('admin/localities', LocalityController::class)->middleware('permission:users.view');

    // Orders
    Route::post('admin/orders/bulk-delete', [\App\Http\Controllers\Api\Admin\OrderController::class, 'bulkDelete'])->middleware('permission:manage orders');
    Route::post('admin/orders', [\App\Http\Controllers\Api\Admin\OrderController::class, 'store'])->middleware('permission:manage orders');
    Route::get('admin/orders/manual-options', [\App\Http\Controllers\Api\Admin\OrderController::class, 'options'])->middleware('permission:view orders');
    Route::get('admin/orders/export', OrderExportController::class)->middleware('permission:view orders');
    Route::get('admin/orders/{order}/export', OrderDocumentExportController::class)->middleware('permission:view orders');
    Route::apiResource('admin/orders', \App\Http\Controllers\Api\Admin\OrderController::class)->except(['store'])->middleware('permission:view orders');

    // Statistics
    Route::get('admin/statistics/favorites', [StatisticsController::class, 'favorites']);
    Route::get('admin/statistics/sales', [StatisticsController::class, 'sales']);

    // Payment Methods (CRUD - auth required for write operations)
    Route::post('payment-methods', [PaymentMethodController::class, 'store'])->middleware('permission:users.view');
    Route::put('payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])->middleware('permission:users.view');
    Route::delete('payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->middleware('permission:users.view');
    Route::post('payment-methods/bulk-delete', [PaymentMethodController::class, 'bulkDelete'])->middleware('permission:users.view');

    // Delivery Methods (CRUD - auth required for write operations)
    Route::post('delivery-methods', [DeliveryMethodController::class, 'store'])->middleware('permission:users.view');
    Route::put('delivery-methods/{deliveryMethod}', [DeliveryMethodController::class, 'update'])->middleware('permission:users.view');
    Route::delete('delivery-methods/{deliveryMethod}', [DeliveryMethodController::class, 'destroy'])->middleware('permission:users.view');
    Route::post('delivery-methods/bulk-delete', [DeliveryMethodController::class, 'bulkDelete'])->middleware('permission:users.view');

    // Contact Messages
    Route::apiResource('contact-messages', ContactController::class)->middleware('permission:users.view');
    Route::post('contact-messages/bulk-delete', [ContactController::class, 'bulkDelete'])->middleware('permission:users.view');
    Route::patch('contact-messages/{contact_message}/mark-read', [ContactController::class, 'markAsRead'])->middleware('permission:users.view');

    // Site Content
    Route::get('/site-content', [\App\Http\Controllers\SiteContentController::class, 'index']);
    Route::put('/site-content/bulk', [\App\Http\Controllers\SiteContentController::class, 'bulkUpdate']);
    Route::put('/site-content/{key}', [\App\Http\Controllers\SiteContentController::class, 'update']);
    Route::post('/site-content/upload', [\App\Http\Controllers\SiteContentController::class, 'uploadImage']);

    // Notifications
    Route::get('/notification-preferences', [NotificationPreferenceController::class, 'index']);
    Route::post('/notification-preferences/{notificationTypeId}/toggle', [NotificationPreferenceController::class, 'toggle']);
    Route::put('/notification-preferences', [NotificationPreferenceController::class, 'updatePreferences']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);
});

// --- Ecommerce Public Routes ---
Route::prefix('catalog')->group(function () {
    Route::get('products', [App\Http\Controllers\Api\CatalogController::class, 'products']);
    Route::get('products/{slug}', [App\Http\Controllers\Api\CatalogController::class, 'product']);
    Route::get('categories', [App\Http\Controllers\Api\CatalogController::class, 'categories']);
    Route::post('coupons/validate', [CouponController::class, 'validateForCheckout']);
    Route::get('delivery-methods', [DeliveryMethodController::class, 'index']);
    Route::get('payment-methods', [PaymentMethodController::class, 'index']);
});

// --- Customer Auth & Orders ---
Route::prefix('customer')->group(function () {
    Route::post('register', [App\Http\Controllers\Api\CustomerAuthController::class, 'register']);
    Route::post('login', [App\Http\Controllers\Api\CustomerAuthController::class, 'login']);
    
    Route::middleware('auth:customer')->group(function () {
        Route::post('logout', [App\Http\Controllers\Api\CustomerAuthController::class, 'logout']);
        Route::get('me', [App\Http\Controllers\Api\CustomerAuthController::class, 'me']);
        Route::put('me', [App\Http\Controllers\Api\CustomerAuthController::class, 'update']);
        
        // Cart / Orders
        Route::get('cart', [App\Http\Controllers\Api\OrderController::class, 'getCart']);
        Route::post('cart', [App\Http\Controllers\Api\OrderController::class, 'addToCart']);
        Route::post('cart/checkout', [App\Http\Controllers\Api\OrderController::class, 'checkout']);
        Route::put('cart/items/{itemId}', [App\Http\Controllers\Api\OrderController::class, 'updateItem']);
        Route::delete('cart/items/{itemId}', [App\Http\Controllers\Api\OrderController::class, 'removeItem']);
        Route::get('orders', [App\Http\Controllers\Api\OrderController::class, 'index']);

        // Favorites
        Route::get('favorites', [App\Http\Controllers\Api\CustomerFavoritesController::class, 'index']);
        Route::post('favorites', [App\Http\Controllers\Api\CustomerFavoritesController::class, 'store']);
        Route::delete('favorites/{product}', [App\Http\Controllers\Api\CustomerFavoritesController::class, 'destroy']);
    });
});

// --- Admin Orders ---
Route::middleware(['auth:sanctum', 'can:view orders'])->prefix('admin')->group(function () {
    Route::get('orders', [App\Http\Controllers\Api\Admin\OrderController::class, 'index']);
    Route::get('orders/export', OrderExportController::class);
    Route::get('orders/{order}/export', OrderDocumentExportController::class);
    Route::get('orders/{id}', [App\Http\Controllers\Api\Admin\OrderController::class, 'show']);
    Route::put('orders/{id}', [App\Http\Controllers\Api\Admin\OrderController::class, 'update']);
    Route::delete('orders', [App\Http\Controllers\Api\Admin\OrderController::class, 'bulkDelete']);
});
