<?php

$prodOrigins = [
	'https://augustamoi.studiovimana.com.ar',
];

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */
	

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

	'allowed_origins' => env('APP_ENV') === 'production' 
        ? $prodOrigins 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://192.168.1.36:5173', 'http://172.30.10.40:5173'], 

    'allowed_origins_patterns' => env('APP_ENV') === 'local' 
        ? ['#^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+|10\.\d+\.\d+\.\d+):\d+$#'] 
        : [],

    // 'allowed_origins' => [
	// 	'http://augusta.test/api', 
	// 	'http://localhost:5177',
	// 	'http://localhost:5173', 
	// 	'http://localhost:3000', 
	// 	'http://127.0.0.1:3000', 
	// 	'http://192.168.1.36:3000', 
	// 	'https://vadmin.studiovimana.com.ar', 'https://studiovimana.com.ar'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
