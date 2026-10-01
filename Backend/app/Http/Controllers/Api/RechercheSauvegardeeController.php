<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RechercheSauvegardeeController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $recherches = $request->user()
            ->recherchesSauvegardees()
            ->with(['ville', 'typeBien'])
            ->orderByDesc('date_creation')
            ->orderByDesc('id')
            ->paginate(12);

        return response()->json($recherches);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom_recherche' => ['required', 'string', 'max:100'],

            'type_transaction' => [
                'nullable',
                'in:vente,location',
            ],

            'ville_id' => [
                'nullable',
                'integer',
                'exists:villes,id',
            ],

            'type_bien_id' => [
                'nullable',
                'integer',
                'exists:type_biens,id',
            ],

            'prix_min' => [
                'nullable',
                'numeric',
                'min:0',
                'max:9999999999.99',
                'decimal:0,2',
            ],

            'prix_max' => [
                'nullable',
                'numeric',
                'min:0',
                'max:9999999999.99',
                'decimal:0,2',
            ],

            'surface_min' => [
                'nullable',
                'numeric',
                'min:0',
                'max:99999999.99',
                'decimal:0,2',
            ],

            'nbr_chambres_min' => [
                'nullable',
                'integer',
                'min:0',
                'max:1000',
            ],

            'quartier' => ['nullable', 'string', 'max:100'],
        ]);

        if (
            isset($data['prix_min'], $data['prix_max'])
            && (float) $data['prix_max'] < (float) $data['prix_min']
        ) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'prix_max' => 'Le prix maximum doit être supérieur ou égal au prix minimum.',
            ]);
        }

        $recherche = $request->user()
            ->recherchesSauvegardees()
            ->create([
                ...$data,
                'alerte_active' => false,
            ]);

        return response()->json(
            $recherche->load(['ville', 'typeBien']),
            201
        );
    }

    public function destroy(Request $request, int $id)
    {
        $recherche = $request->user()
            ->recherchesSauvegardees()
            ->findOrFail($id);

        $recherche->delete();

        return response()->noContent();
    }
}
