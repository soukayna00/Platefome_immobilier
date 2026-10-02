<?php

use App\Http\Controllers\Admin\AnnonceController as AdminAnnonceController;
use App\Http\Controllers\Admin\CatalogueController as AdminCatalogueController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SignalementController as AdminSignalementController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AnnonceController;
use App\Http\Controllers\Api\BienController;
use App\Http\Controllers\Api\CatalogueController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\DemandeVisiteController;
use App\Http\Controllers\Api\FavoriController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RechercheSauvegardeeController;
use App\Http\Controllers\Api\SignalementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::get('/annonces', [AnnonceController::class, 'index']);

Route::get('/annonces/{id}', [AnnonceController::class, 'show'])
    ->whereNumber('id');

Route::get('/villes', [CatalogueController::class, 'villes']);
Route::get('/types-bien', [CatalogueController::class, 'typesBien']);

// Comptes connectés et actifs
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    // Compte
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::patch('/profile', [ProfileController::class, 'update']);

    Route::put('/password', [PasswordController::class, 'update'])
        ->middleware('throttle:5,1');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);

    Route::patch('/notifications/{id}/lecture', [
        NotificationController::class,
        'markRead',
    ])->whereNumber('id');

    // Recherches sauvegardées
    Route::get('/mes-recherches', [
        RechercheSauvegardeeController::class,
        'index',
    ]);

    Route::post('/mes-recherches', [
        RechercheSauvegardeeController::class,
        'store',
    ]);

    Route::delete('/mes-recherches/{id}', [
        RechercheSauvegardeeController::class,
        'destroy',
    ])->whereNumber('id');

    // Annonces du propriétaire
    Route::get('/mes-annonces', [AnnonceController::class, 'mine']);

    Route::put('/mes-annonces/{id}', [AnnonceController::class, 'update'])
        ->whereNumber('id');

    Route::delete('/mes-annonces/{id}', [AnnonceController::class, 'destroy'])
        ->whereNumber('id');

    // Favoris
    Route::get('/favoris', [FavoriController::class, 'index']);

    Route::post('/favoris/{id}', [FavoriController::class, 'store'])
        ->whereNumber('id');

    Route::delete('/favoris/{id}', [FavoriController::class, 'destroy'])
        ->whereNumber('id');

    // Biens du propriétaire
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

    // Demandes de visite
    Route::post('/annonces/{id}/visites', [
        DemandeVisiteController::class,
        'store',
    ])->whereNumber('id');

    Route::get('/mes-visites', [DemandeVisiteController::class, 'mine']);

    Route::get('/visites-recues', [DemandeVisiteController::class, 'received']);

    Route::patch('/visites-recues/{id}/statut', [
        DemandeVisiteController::class,
        'updateStatus',
    ])->whereNumber('id');

    Route::post('/visites-recues/{id}/conversation', [
        DemandeVisiteController::class,
        'contact',
    ])->whereNumber('id');

    // Messagerie
    Route::get('/conversations', [ConversationController::class, 'index']);

    Route::get('/conversations/{id}', [ConversationController::class, 'show'])
        ->whereNumber('id');

    Route::post('/conversations/{id}/messages', [
        ConversationController::class,
        'send',
    ])->whereNumber('id')->middleware('throttle:60,1');

    Route::post('/annonces/{id}/conversation', [
        ConversationController::class,
        'start',
    ])->whereNumber('id');

    // Signalements
    Route::post('/annonces/{id}/signalements', [
        SignalementController::class,
        'store',
    ])->whereNumber('id')->middleware('throttle:10,1');

    // Administration
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Catalogue des villes
        Route::get('/villes', [AdminCatalogueController::class, 'villes']);

        Route::post('/villes', [AdminCatalogueController::class, 'storeVille']);

        Route::put('/villes/{id}', [
            AdminCatalogueController::class,
            'updateVille',
        ])->whereNumber('id');

        // Catalogue des types de biens
        Route::get('/types-bien', [AdminCatalogueController::class, 'typesBien']);

        Route::post('/types-bien', [
            AdminCatalogueController::class,
            'storeTypeBien',
        ]);

        Route::put('/types-bien/{id}', [
            AdminCatalogueController::class,
            'updateTypeBien',
        ])->whereNumber('id');

        // Modération des signalements
        Route::get('/signalements', [AdminSignalementController::class, 'index']);

        Route::patch('/signalements/{id}', [
            AdminSignalementController::class,
            'update',
        ])->whereNumber('id');

        // Gestion des annonces
        Route::get('/annonces', [AdminAnnonceController::class, 'index']);

        Route::get('/annonces/{id}', [AdminAnnonceController::class, 'show'])
            ->whereNumber('id');

        Route::patch('/annonces/{id}/statut', [
            AdminAnnonceController::class,
            'updateStatus',
        ])->whereNumber('id');

        // Gestion des utilisateurs
        Route::get('/utilisateurs', [AdminUserController::class, 'index']);

        Route::patch('/utilisateurs/{id}/statut', [
            AdminUserController::class,
            'updateStatus',
        ])->whereNumber('id');
    });
});
