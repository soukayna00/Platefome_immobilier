<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Annonce;

class ConversationController extends Controller
{
    private function accessible(Request $request)
    {
        return Conversation::query()
            ->where(function ($query) use ($request) {
                $query->where('proprietaire_id', $request->user()->id)
                    ->orWhere('interlocuteur_id', $request->user()->id);
            });
    }

    public function index(Request $request)
    {
        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $conversations = $this->accessible($request)
            ->with([
                'proprietaire:id,nom,prenom',
                'interlocuteur:id,nom,prenom',
                'annonce.bien.photos',
            ])
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($conversations);
    }

    public function show(Request $request, int $id)
    {
        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $conversation = $this->accessible($request)
            ->with([
                'proprietaire:id,nom,prenom',
                'interlocuteur:id,nom,prenom',
                'annonce.bien',
            ])
            ->findOrFail($id);

        // Les messages les plus récents sont sur la première page.
        $messages = $conversation->messages()
            ->orderByDesc('id')
            ->paginate(50);

        return response()->json([
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    public function send(Request $request, int $id)
    {
        $data = $request->validate([
            'contenu' => ['required', 'string', 'max:5000'],
        ]);

        $message = DB::transaction(function () use ($request, $id, $data) {
            $conversation = $this->accessible($request)
                ->lockForUpdate()
                ->findOrFail($id);

            if ($conversation->statut_conversation !== 'active') {
                abort(409, 'Cette conversation est fermée.');
            }

            return $conversation->messages()->create([
                'expediteur_id' => $request->user()->id,
                'contenu' => $data['contenu'],
            ]);
        });

        return response()->json($message->fresh(), 201);
    }
    public function start(Request $request, int $id)
{
    $conversation = DB::transaction(function () use ($request, $id) {
        $annonce = Annonce::query()
            ->where('statut_annonce', 'publiee')
            ->lockForUpdate()
            ->findOrFail($id);

        if ((int) $annonce->user_id === (int) $request->user()->id) {
            abort(
                403,
                'Vous ne pouvez pas vous contacter sur votre propre annonce.'
            );
        }

        return Conversation::firstOrCreate(
            [
                'annonce_id' => $annonce->id,
                'interlocuteur_id' => $request->user()->id,
            ],
            [
                'proprietaire_id' => $annonce->user_id,
                'statut_conversation' => 'active',
            ]
        );
    });

    return response()->json($conversation);
}
}
