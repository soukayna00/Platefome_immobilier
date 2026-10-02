<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use App\Models\Bien;
use App\Models\Signalement;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'utilisateurs' => User::count(),

            'biens' => Bien::count(),

            'annonces_publiees' => Annonce::query()
                ->where('statut_annonce', 'publiee')
                ->count(),

            'signalements_en_attente' => Signalement::query()
                ->where('statut', 'en_attente')
                ->count(),
        ]);
    }
}
