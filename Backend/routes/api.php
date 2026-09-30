<?php

use App\Http\Controllers\Api\AnnonceController;
use App\Http\Controllers\Api\CatalogueController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FavoriController;
use App\Http\Controllers\Api\BienController;

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

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/favoris', [FavoriController::class, 'index']);

    Route::post('/favoris/{id}', [FavoriController::class, 'store'])
        ->whereNumber('id');

    Route::delete('/favoris/{id}', [FavoriController::class, 'destroy'])
        ->whereNumber('id');
});

// bien controller
Route::get('/mes-biens', [BienController::class, 'index']);
Route::post('/mes-biens', [BienController::class, 'store']);
Route::get('/mes-biens/{id}', [BienController::class, 'show'])
    ->whereNumber('id');

Route::put('/mes-biens/{id}', [BienController::class, 'update'])
    ->whereNumber('id');

Route::delete('/mes-biens/{id}', [BienController::class, 'destroy'])
    ->whereNumber('id');
