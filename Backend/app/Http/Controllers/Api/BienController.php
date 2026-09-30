<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class BienController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $biens = $request->user()
            ->biens()
            ->with(['ville', 'typeBien', 'photos'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(12);

        return response()->json($biens);
    }
    public function show(Request $request, int $id)
{
    $bien = $request->user()
        ->biens()
        ->with(['ville', 'typeBien', 'photos'])
        ->findOrFail($id);

    return response()->json($bien);
}

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],

            'ville_id' => ['required', 'integer', 'exists:villes,id'],
            'type_bien_id' => [
                'required',
                'integer',
                'exists:type_biens,id',
            ],

            'surface' => [
                'required',
                'numeric',
                'min:0.01',
                'max:99999999.99',
                'decimal:0,2',
            ],

            'nbr_chambres' => ['sometimes', 'integer', 'min:0', 'max:1000'],
            'nbr_salle_bain' => ['sometimes', 'integer', 'min:0', 'max:1000'],
            'etage' => ['nullable', 'integer', 'min:-20', 'max:200'],

            'parking' => ['sometimes', 'boolean'],
            'ascenseur' => ['sometimes', 'boolean'],

            'etat_bien' => ['nullable', 'string', 'max:50'],
            'adresse_approx' => ['nullable', 'string', 'max:255'],
            'quartier' => ['nullable', 'string', 'max:100'],

            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            'miniature' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'photos' => ['sometimes', 'array', 'max:4'],
            'photos.*' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        // Ces fichiers appartiennent à Photo, pas aux colonnes de Bien.
        unset($data['miniature'], $data['photos']);

        $storedPaths = [];

        try {
            $bien = DB::transaction(function () use (
                $request,
                $data,
                &$storedPaths
            ) {
                // Le propriétaire est toujours l'utilisateur connecté.
                $bien = $request->user()->biens()->create($data);

                // La miniature vient en premier : ordre 0.
                $files = [
                    $request->file('miniature'),
                    ...$request->file('photos', []),
                ];

                foreach ($files as $ordre => $file) {
                    $path = $file->store(
                        "biens/{$bien->id}",
                        'public'
                    );

                    if ($path === false) {
                        throw new RuntimeException(
                            'Impossible d’enregistrer une photo.'
                        );
                    }

                    $storedPaths[] = $path;

                    $bien->photos()->create([
                        'url_photo' => '/storage/'.$path,
                        'ordre' => $ordre,
                    ]);
                }

                return $bien->load(['ville', 'typeBien', 'photos']);
            });
        } catch (Throwable $exception) {
            // La transaction annule les lignes SQL.
            // On supprime aussi les fichiers déjà écrits.
            if ($storedPaths !== []) {
                Storage::disk('public')->delete($storedPaths);
            }

            throw $exception;
        }

        return response()->json($bien, 201);
    }
    public function update(Request $request, int $id)
{
    $bien = $request->user()->biens()->findOrFail($id);

    $data = $request->validate([
        'titre' => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string', 'max:10000'],
        'etat_bien' => ['nullable', 'in:neuf,bon_etat,a_renover'],
        'ville_id' => ['required', 'integer', 'exists:villes,id'],
        'type_bien_id' => [
            'required', 'integer', 'exists:type_biens,id',
        ],
        'surface' => [
            'required', 'numeric', 'min:0.01',
            'max:99999999.99', 'decimal:0,2',
        ],
        'nbr_chambres' => ['required', 'integer', 'min:0', 'max:1000'],
        'nbr_salle_bain' => ['required', 'integer', 'min:0', 'max:1000'],
        'etage' => ['nullable', 'integer', 'min:-20', 'max:200'],
        'parking' => ['required', 'boolean'],
        'ascenseur' => ['required', 'boolean'],
        'quartier' => ['nullable', 'string', 'max:100'],
        'adresse_approx' => ['nullable', 'string', 'max:255'],
    ]);

    $bien->update($data);

    return response()->json(
        $bien->load(['ville', 'typeBien', 'photos'])
    );
}

    public function destroy(Request $request, int $id)
{
    try {
        $paths = DB::transaction(function () use ($request, $id) {
            $bien = $request->user()
                ->biens()
                ->lockForUpdate()
                ->findOrFail($id);

            if ($bien->annonces()->exists()) {
                abort(
                    409,
                    'Ce bien possède une annonce. Supprimez son annonce avant de supprimer le bien.'
                );
            }

            // Nettoyer uniquement les images téléchargées pour ce bien.
            $prefix = '/storage/biens/'.$bien->id.'/';

            $paths = $bien->photos()
                ->pluck('url_photo')
                ->filter(fn ($url) => str_starts_with($url, $prefix))
                ->map(fn ($url) => substr($url, strlen('/storage/')))
                ->values()
                ->all();

            $bien->delete();

            return $paths;
        });
    } catch (\Illuminate\Database\QueryException $exception) {
        // PostgreSQL refuse aussi les autres références éventuelles.
        if ((string) $exception->getCode() === '23503') {
            abort(
                409,
                'Ce bien est encore lié à d’autres données et ne peut pas être supprimé.'
            );
        }

        throw $exception;
    }

    if ($paths !== []) {
        Storage::disk('public')->delete($paths);
    }

    return response()->noContent();
}
}
