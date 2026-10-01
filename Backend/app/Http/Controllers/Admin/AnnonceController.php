<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnnonceController extends Controller
{
    private const RELATIONS = [
        'auteur:id,nom,prenom',
        'bien.ville',
        'bien.typeBien',
        'bien.photos',
    ];

    public function index(Request $request)
    {
        $filters = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'statut' => [
                'sometimes',
                'nullable',
                'in:brouillon,publiee,suspendue',
            ],
            'transaction' => [
                'sometimes',
                'nullable',
                'in:vente,location',
            ],
        ]);

        $query = Annonce::query()->with(self::RELATIONS);

        if (isset($filters['statut'])) {
            $query->where('statut_annonce', $filters['statut']);
        }

        if (isset($filters['transaction'])) {
            $query->where('type_transaction', $filters['transaction']);
        }

        return response()->json(
            $query
                ->orderByDesc('date_creation')
                ->orderByDesc('id')
                ->paginate(12)
                ->withQueryString()
        );
    }

    public function show(int $id)
    {
        return response()->json(
            Annonce::query()
                ->with(self::RELATIONS)
                ->findOrFail($id)
        );
    }

    public function updateStatus(Request $request, int $id)
    {
        $data = $request->validate([
            'statut_annonce' => ['required', 'in:suspendue,publiee'],
        ]);

        $annonce = DB::transaction(function () use ($id, $data) {
            $annonce = Annonce::query()
                ->lockForUpdate()
                ->findOrFail($id);

            $currentStatus = $annonce->statut_annonce;
            $nextStatus = $data['statut_annonce'];

            if ($currentStatus === $nextStatus) {
                return $annonce->load(self::RELATIONS);
            }

            if (
                $nextStatus === 'suspendue'
                && $currentStatus !== 'publiee'
            ) {
                abort(
                    409,
                    'Seule une annonce publiée peut être suspendue.'
                );
            }

            if (
                $nextStatus === 'publiee'
                && $currentStatus !== 'suspendue'
            ) {
                abort(
                    409,
                    'Seule une annonce suspendue peut être rétablie ici.'
                );
            }

            $annonce->statut_annonce = $nextStatus;
            $annonce->date_modification = now();
            $annonce->save();

            return $annonce->load(self::RELATIONS);
        });

        return response()->json($annonce);
    }
    
}
