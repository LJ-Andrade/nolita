<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Customer transactional emails
    |--------------------------------------------------------------------------
    |
    | Links and images in customer emails must point to the public storefront,
    | never to the API host.
    |
    */

    'brand_name' => 'Nolita',

    'storefront_url' => env('APP_STOREFRONT_URL', 'https://nolita.com.ar'),

    'logo_path' => '/logo-black.png',

    'timezone' => env('CUSTOMER_MAIL_TIMEZONE', 'America/Argentina/Buenos_Aires'),

    // Outside production every customer email is redirected here when set.
    'test_recipient' => env('CUSTOMER_MAIL_TEST_RECIPIENT'),

];
