<?php

use App\Http\Controllers\Api\AnnonceController;
use App\Http\Controllers\Api\CatalogueController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok']));

//annonce controller
Route::get('/annonces', [AnnonceController::class, 'index']);
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/annonces/{id}', [AnnonceController::class, 'show']);


//catalogue controller
Route::get('/villes', [CatalogueController::class, 'villes']);
Route::get('/types-bien', [CatalogueController::class, 'typesBien']);
