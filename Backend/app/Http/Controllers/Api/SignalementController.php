<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SignalementController extends Controller
{
    public function store(Request $request, int $id)
    {
        $data = $request->validate([
            'motif' => [
                'required',
                'in:annonce_frauduleuse,informations_incorrectes,photos_inappropriees,bien_indisponible,autre',
            ],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $signalement = DB::transaction(function () use ($request, $id, $data) {
            $annonce = Annonce::query()
                ->where('statut_annonce', 'publiee')
                ->lockForUpdate()
                ->findOrFail($id);

            $exists = $annonce->signalements()
                ->where('user_id', $request->user()->id)
                ->where('statut', 'en_attente')
                ->exists();

            if ($exists) {
                abort(
                    409,
                    'Vous avez déjà un signalement en attente pour cette annonce.'
                );
            }

            return $annonce->signalements()->create([
                'user_id' => $request->user()->id,
                'motif' => $data['motif'],
                'description' => $data['description'] ?? null,
                'statut' => 'en_attente',
            ]);
        });

        return response()->json($signalement, 201);
    }
}
