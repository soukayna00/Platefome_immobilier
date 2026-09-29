<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use Illuminate\Http\Request;

class AnnonceController extends Controller
{
    public function index(Request $request)
    {
        $filtres = $request->validate([
            'transaction' => 'sometimes|in:vente,location',
            'ville_id' => 'sometimes|integer|exists:villes,id',
            'type_bien_id' => 'sometimes|integer|exists:type_biens,id',
        ]);

        $annonces = Annonce::query()
            ->with(['bien.ville', 'bien.typeBien', 'bien.photos'])
            ->where('statut_annonce', 'publiee')
            ->when(
                isset($filtres['transaction']),
                fn ($query) => $query->where(
                    'type_transaction',
                    $filtres['transaction']
                )
            )
            ->when(
                isset($filtres['ville_id']),
                fn ($query) => $query->whereHas(
                    'bien',
                    fn ($bien) => $bien->where('ville_id', $filtres['ville_id'])
                )
            )
            ->when(
                isset($filtres['type_bien_id']),
                fn ($query) => $query->whereHas(
                    'bien',
                    fn ($bien) => $bien->where(
                        'type_bien_id',
                        $filtres['type_bien_id']
                    )
                )
            )
            ->orderByDesc('date_publication')
            ->paginate(12);

        return response()->json($annonces);
    }

    public function show(int $id)
    {
        $annonce = Annonce::query()
            ->with(['bien.ville', 'bien.typeBien', 'bien.photos'])
            ->where('statut_annonce', 'publiee')
            ->findOrFail($id);

        return response()->json($annonce);
    }
}
