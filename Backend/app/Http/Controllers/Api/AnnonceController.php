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
            'transaction' => ['sometimes', 'nullable', 'in:vente,location'],
            'ville_id' => ['sometimes', 'nullable', 'integer', 'exists:villes,id'],
            'type_bien_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:type_biens,id',
            ],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'quarter' => ['sometimes', 'nullable', 'string', 'max:100'],
            'max' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $query = Annonce::query()
            ->with(['bien.ville', 'bien.typeBien', 'bien.photos'])
            ->where('statut_annonce', 'publiee');

        if (isset($filtres['transaction'])) {
            $query->where('type_transaction', $filtres['transaction']);
        }

        if (isset($filtres['ville_id'])) {
            $query->whereHas(
                'bien',
                fn ($bien) => $bien->where('ville_id', $filtres['ville_id'])
            );
        }

        if (isset($filtres['type_bien_id'])) {
            $query->whereHas(
                'bien',
                fn ($bien) => $bien->where(
                    'type_bien_id',
                    $filtres['type_bien_id']
                )
            );
        }

        if (isset($filtres['city'])) {
            $query->whereHas(
                'bien.ville',
                fn ($ville) => $ville->where('nom_ville', $filtres['city'])
            );
        }

        if (isset($filtres['type'])) {
            $query->whereHas(
                'bien.typeBien',
                fn ($type) => $type->where('libelle', $filtres['type'])
            );
        }

        if (isset($filtres['quarter'])) {
            $query->whereHas(
                'bien',
                fn ($bien) => $bien->where(
                    'quartier',
                    'ilike',
                    '%'.$filtres['quarter'].'%'
                )
            );
        }

        if (isset($filtres['max'])) {
            $query->where('prix', '<=', $filtres['max']);
        }

        $annonces = $query
            ->orderByDesc('date_publication')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

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
