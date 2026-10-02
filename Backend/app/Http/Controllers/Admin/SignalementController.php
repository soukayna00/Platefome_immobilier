<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Signalement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SignalementController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'statut' => [
                'sometimes',
                'nullable',
                'in:en_attente,traite,rejete',
            ],
        ]);

        $signalements = Signalement::query()
            ->with([
                'utilisateur:id,nom,prenom',
                'annonce.bien.ville',
                'annonce.bien.photos',
            ])
            ->when(
                isset($data['statut']),
                fn ($query) => $query->where('statut', $data['statut'])
            )
            ->orderByDesc('date_signalement')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        return response()->json($signalements);
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'statut' => ['required', 'in:traite,rejete'],
        ]);

        $signalement = DB::transaction(function () use ($id, $data) {
            $signalement = Signalement::query()
                ->lockForUpdate()
                ->findOrFail($id);

            if ($signalement->statut !== 'en_attente') {
                abort(409, 'Ce signalement a déjà été traité.');
            }

            $signalement->statut = $data['statut'];
            $signalement->date_traitement = now();
            $signalement->save();

            return $signalement->load([
                'utilisateur:id,nom,prenom',
                'annonce.bien.ville',
                'annonce.bien.photos',
            ]);
        });

        return response()->json($signalement);
    }
}
