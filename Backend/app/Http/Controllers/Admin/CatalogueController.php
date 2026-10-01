<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TypeBien;
use App\Models\Ville;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CatalogueController extends Controller
{
    public function villes(): JsonResponse
    {
        return response()->json(
            Ville::query()
                ->orderBy('nom_ville')
                ->get(['id', 'nom_ville'])
        );
    }

    public function storeVille(Request $request): JsonResponse
    {
        $this->trimField($request, 'nom_ville');

        $data = $request->validate([
            'nom_ville' => [
                'required',
                'string',
                'max:100',
                Rule::unique('villes', 'nom_ville'),
            ],
        ]);

        $ville = Ville::create($data);

        return response()->json($ville, 201);
    }

    public function updateVille(Request $request, int $id): JsonResponse
    {
        $ville = Ville::findOrFail($id);

        $this->trimField($request, 'nom_ville');

        $data = $request->validate([
            'nom_ville' => [
                'required',
                'string',
                'max:100',
                Rule::unique('villes', 'nom_ville')
                    ->ignore($ville->id),
            ],
        ]);

        $ville->update($data);

        return response()->json($ville->fresh());
    }

    public function typesBien(): JsonResponse
    {
        return response()->json(
            TypeBien::query()
                ->orderBy('libelle')
                ->get(['id', 'libelle'])
        );
    }

    public function storeTypeBien(Request $request): JsonResponse
    {
        $this->trimField($request, 'libelle');

        $data = $request->validate([
            'libelle' => [
                'required',
                'string',
                'max:100',
                Rule::unique('type_biens', 'libelle'),
            ],
        ]);

        $type = TypeBien::create($data);

        return response()->json($type, 201);
    }

    public function updateTypeBien(Request $request, int $id): JsonResponse
    {
        $type = TypeBien::findOrFail($id);

        $this->trimField($request, 'libelle');

        $data = $request->validate([
            'libelle' => [
                'required',
                'string',
                'max:100',
                Rule::unique('type_biens', 'libelle')
                    ->ignore($type->id),
            ],
        ]);

        $type->update($data);

        return response()->json($type->fresh());
    }

    private function trimField(Request $request, string $field): void
    {
        $value = $request->input($field);

        if (is_string($value)) {
            $request->merge([
                $field => trim($value),
            ]);
        }
    }
}
