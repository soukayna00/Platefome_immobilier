<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'statut' => [
                'sometimes',
                'nullable',
                'in:actif,suspendu',
            ],
        ]);

        $query = User::query()
            ->where('type_compte', 'utilisateur')
            ->select([
                'id',
                'nom',
                'prenom',
                'email',
                'statut_compte',
                'type_compte',
                'created_at',
            ])
            ->withCount(['biens', 'annonces']);

        if (isset($filters['statut'])) {
            $query->where('statut_compte', $filters['statut']);
        }

        return response()->json(
            $query
                ->orderByDesc('id')
                ->paginate(12)
                ->withQueryString()
        );
    }

    public function updateStatus(Request $request, int $id)
    {
        $data = $request->validate([
            'statut_compte' => ['required', 'in:actif,suspendu'],
        ]);

        $user = DB::transaction(function () use ($id, $data) {
            $user = User::query()
                ->where('type_compte', 'utilisateur')
                ->lockForUpdate()
                ->findOrFail($id);

            $user->statut_compte = $data['statut_compte'];
            $user->save();

            return $user;
        });

        return response()->json(
            $user->only([
                'id',
                'nom',
                'prenom',
                'email',
                'statut_compte',
                'type_compte',
            ])
        );
    }
}
