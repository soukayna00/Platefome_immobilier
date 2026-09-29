<?php

use App\Http\Controllers\Api\AnnonceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::get('/annonces', [AnnonceController::class, 'index']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/annonces/{id}', [AnnonceController::class, 'show']);
