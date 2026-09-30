<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

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

   public function store(Request $request, int $id)
{
    $data = $request->validate([
        'type_transaction' => ['required', 'in:vente,location'],
        'prix' => [
            'required',
            'numeric',
            'min:0.01',
            'max:9999999999.99',
            'decimal:0,2',
        ],
        'statut_annonce' => ['required', 'in:brouillon,publiee'],
    ]);

    $annonce = DB::transaction(function () use ($request, $id, $data) {
        $bien = $request->user()
            ->biens()
            ->lockForUpdate()
            ->findOrFail($id);

        $annonce = $bien->annonces()->create([
            'user_id' => $request->user()->id,
            'type_transaction' => $data['type_transaction'],
            'prix' => $data['prix'],
            'statut_annonce' => $data['statut_annonce'],
            'date_publication' => $data['statut_annonce'] === 'publiee'
                ? today()->toDateString()
                : null,
        ]);

        return $annonce->load([
            'bien.ville',
            'bien.typeBien',
            'bien.photos',
        ]);
    });

        return response()->json($annonce, 201);
    }

    public function show(int $id)
    {
        $annonce = Annonce::query()
            ->with(['bien.ville', 'bien.typeBien', 'bien.photos'])
            ->where('statut_annonce', 'publiee')
            ->findOrFail($id);

        return response()->json($annonce);
    }
    public function mine(Request $request)
{
    $request->validate([
        'page' => ['sometimes', 'integer', 'min:1'],
    ]);

    $annonces = $request->user()
        ->annonces()
        ->with(['bien.ville', 'bien.typeBien', 'bien.photos'])
        ->orderByDesc('date_creation')
        ->orderByDesc('id')
        ->paginate(12);

    return response()->json($annonces);
}
    public function update(Request $request, int $id)
    {
    $data = $request->validate([
        'type_transaction' => ['required', 'in:vente,location'],
        'prix' => [
            'required',
            'numeric',
            'min:0.01',
            'max:9999999999.99',
            'decimal:0,2',
        ],
        'statut_annonce' => ['required', 'in:brouillon,publiee'],
    ]);

    $annonce = DB::transaction(function () use ($request, $id, $data) {
        $annonce = $request->user()
            ->annonces()
            ->lockForUpdate()
            ->findOrFail($id);

        $wasPublished = $annonce->statut_annonce === 'publiee';
        $willBePublished = $data['statut_annonce'] === 'publiee';

        $annonce->fill($data);

        if ($willBePublished && ! $wasPublished) {
            $annonce->date_publication = today()->toDateString();
        } elseif (! $willBePublished) {
            $annonce->date_publication = null;
        }

        $annonce->date_modification = now();
        $annonce->save();

        return $annonce->load([
            'bien.ville',
            'bien.typeBien',
            'bien.photos',
        ]);
    });

    return response()->json($annonce);
   }


   public function destroy(Request $request, int $id)
   {
    try {
        DB::transaction(function () use ($request, $id) {
            $annonce = $request->user()
                ->annonces()
                ->lockForUpdate()
                ->findOrFail($id);

            if (
                $annonce->conversations()->exists() ||
                $annonce->demandesVisite()->exists() ||
                $annonce->signalements()->exists()
            ) {
                abort(
                    409,
                    'Cette annonce possède des conversations, des demandes de visite ou des signalements. Remettez-la en brouillon pour la retirer des annonces publiques.'
                );
            }

            $annonce->delete();
        });
    } catch (QueryException $exception) {
        if (
            ($exception->errorInfo[0] ?? (string) $exception->getCode())
            === '23503'
        ) {
            abort(
                409,
                'Cette annonce est encore liée à d’autres données. Remettez-la en brouillon pour la retirer des annonces publiques.'
            );
        }

        throw $exception;
    }

    return response()->noContent();
   }
}
