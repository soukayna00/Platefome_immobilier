<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TypeBien;
use App\Models\Ville;
use Illuminate\Http\JsonResponse;

class CatalogueController extends Controller
{
    public function villes(): JsonResponse
    {
        return response()->json(
            Ville::query()->orderBy('nom_ville')->get(['id', 'nom_ville'])
        );
    }

    public function typesBien(): JsonResponse
    {
        return response()->json(
            TypeBien::query()->orderBy('libelle')->get(['id', 'libelle'])
        );
    }
}
