<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DemandeVisiteController extends Controller
{
    public function store(Request $request, int $id)
    {
        $data = $request->validate([
            'date_visite' => [
                'required',
                'date_format:Y-m-d',
                'after:today',
            ],
            'heure_visite' => [
                'required',
                'date_format:H:i',
            ],
            'message' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $demande = DB::transaction(function () use ($request, $id, $data) {
            $annonce = Annonce::query()
                ->where('statut_annonce', 'publiee')
                ->lockForUpdate()
                ->findOrFail($id);

            if ((int) $annonce->user_id === (int) $request->user()->id) {
                abort(
                    403,
                    'Vous ne pouvez pas demander une visite de votre propre annonce.'
                );
            }

            $hasPendingRequest = $annonce->demandesVisite()
                ->where('user_id', $request->user()->id)
                ->where('statut', 'en_attente')
                ->exists();

            if ($hasPendingRequest) {
                abort(
                    409,
                    'Vous avez déjà une demande de visite en attente pour cette annonce.'
                );
            }

            $demande = $annonce->demandesVisite()->create([
                'user_id' => $request->user()->id,
                'date_visite' => $data['date_visite'],
                'heure_visite' => $data['heure_visite'],
                'message' => $data['message'] ?? null,
                'statut' => 'en_attente',
            ]);

            return $demande->load([
                'annonce.bien.ville',
                'annonce.bien.photos',
            ]);
        });

        return response()->json($demande, 201);
    }
    public function received(Request $request)
{
    $request->validate([
        'page' => ['sometimes', 'integer', 'min:1'],
    ]);

    $demandes = \App\Models\DemandeVisite::query()
        ->whereHas('annonce', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
        ->with([
            'utilisateur:id,nom,prenom',
            'annonce.bien.ville',
            'annonce.bien.photos',
        ])
        ->orderByDesc('date_demande')
        ->orderByDesc('id')
        ->paginate(12);

    return response()->json($demandes);
}
    public function updateStatus(Request $request, int $id)
{
    $data = $request->validate([
        'statut' => ['required', 'in:acceptee,refusee'],
    ]);

    $demande = DB::transaction(function () use ($request, $id, $data) {
        $demande = \App\Models\DemandeVisite::query()
            ->whereHas('annonce', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->lockForUpdate()
            ->findOrFail($id);

        if ($demande->statut !== 'en_attente') {
            abort(409, 'Cette demande a déjà été traitée.');
        }

        if (
            $data['statut'] === 'acceptee'
            && $demande->date_visite->toDateString() < today()->toDateString()
        ) {
            abort(422, 'La date proposée est déjà passée.');
        }

        $demande->update([
            'statut' => $data['statut'],
        ]);

        return $demande->load([
            'utilisateur:id,nom,prenom',
            'annonce.bien.ville',
            'annonce.bien.photos',
        ]);
    });

    return response()->json($demande);
}

    public function contact(Request $request, int $id)
{
    $conversation = DB::transaction(function () use ($request, $id) {
        $demande = \App\Models\DemandeVisite::query()
            ->whereHas('annonce', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->lockForUpdate()
            ->findOrFail($id);

        return \App\Models\Conversation::firstOrCreate(
            [
                'annonce_id' => $demande->annonce_id,
                'interlocuteur_id' => $demande->user_id,
            ],
            [
                'proprietaire_id' => $request->user()->id,
                'statut_conversation' => 'active',
            ]
        );
    });

    return response()->json($conversation);
}

    public function mine(Request $request)
{
    $request->validate([
        'page' => ['sometimes', 'integer', 'min:1'],
    ]);

    $demandes = $request->user()
        ->demandesVisite()
        ->with([
            'annonce.bien.ville',
            'annonce.bien.photos',
        ])
        ->orderByDesc('date_demande')
        ->orderByDesc('id')
        ->paginate(12);

    return response()->json($demandes);
}
}
