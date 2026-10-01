<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});
Route::post(
    '/admin/login',
    [\App\Http\Controllers\Admin\AuthController::class, 'store']
)->middleware('throttle:8,1');

require __DIR__.'/auth.php';
