<?php

use App\Http\Controllers\Api\AnnonceController;
use App\Http\Controllers\Api\BienController;
use App\Http\Controllers\Api\CatalogueController;
use App\Http\Controllers\Api\FavoriController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::get('/annonces', [AnnonceController::class, 'index']);

Route::get('/annonces/{id}', [AnnonceController::class, 'show'])
    ->whereNumber('id');

Route::get('/villes', [CatalogueController::class, 'villes']);
Route::get('/types-bien', [CatalogueController::class, 'typesBien']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/mes-annonces', [AnnonceController::class, 'mine']);

    Route::put('/mes-annonces/{id}', [AnnonceController::class, 'update'])
    ->whereNumber('id');

    Route::delete('/mes-annonces/{id}', [AnnonceController::class, 'destroy'])
    ->whereNumber('id');

    Route::get('/favoris', [FavoriController::class, 'index']);

    Route::post('/favoris/{id}', [FavoriController::class, 'store'])
        ->whereNumber('id');

    Route::delete('/favoris/{id}', [FavoriController::class, 'destroy'])
        ->whereNumber('id');

    Route::get('/mes-biens', [BienController::class, 'index']);
    Route::post('/mes-biens', [BienController::class, 'store']);

    Route::get('/mes-biens/{id}', [BienController::class, 'show'])
        ->whereNumber('id');

    Route::put('/mes-biens/{id}', [BienController::class, 'update'])
        ->whereNumber('id');

    Route::delete('/mes-biens/{id}', [BienController::class, 'destroy'])
        ->whereNumber('id');

    Route::post('/mes-biens/{id}/annonces', [AnnonceController::class, 'store'])
        ->whereNumber('id');
});
