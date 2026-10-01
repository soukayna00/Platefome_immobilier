<?php

use App\Http\Controllers\Api\AnnonceController;
use App\Http\Controllers\Api\BienController;
use App\Http\Controllers\Api\CatalogueController;
use App\Http\Controllers\Api\FavoriController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DemandeVisiteController;
use App\Http\Controllers\Api\ConversationController;

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
    Route::post('/annonces/{id}/visites', [DemandeVisiteController::class, 'store'])
        ->whereNumber('id');
    Route::get('/visites-recues',[\App\Http\Controllers\Api\DemandeVisiteController::class, 'received']);
    Route::patch('/visites-recues/{id}/statut',[DemandeVisiteController::class, 'updateStatus'])->whereNumber('id');


    Route::post('/visites-recues/{id}/conversation',[DemandeVisiteController::class, 'contact'])->whereNumber('id');
    Route::get('/conversations', [ConversationController::class, 'index']);

   Route::get('/conversations/{id}', [ConversationController::class, 'show'])->whereNumber('id');

   Route::post('/conversations/{id}/messages',[ConversationController::class, 'send'])->whereNumber('id')->middleware('throttle:60,1');

   Route::get('/mes-visites',[DemandeVisiteController::class, 'mine']);
});
