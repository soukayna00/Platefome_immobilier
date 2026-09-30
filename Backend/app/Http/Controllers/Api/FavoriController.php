<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriController extends Controller
{
    public function index(Request $request)
    {
        $annonces = $request->user()
            ->annoncesFavorites()
            ->with(['bien.ville', 'bien.typeBien', 'bien.photos'])
            ->where('statut_annonce', 'publiee')
            ->orderByPivot('date_ajout', 'desc')
            ->get();

        return response()->json($annonces);
    }

    public function store(Request $request, int $id)
    {
        $annonce = Annonce::query()
            ->where('statut_annonce', 'publiee')
            ->findOrFail($id);

        DB::table('favoris')->insertOrIgnore([
            'user_id' => $request->user()->id,
            'annonce_id' => $annonce->id,
            'date_ajout' => now(),
        ]);

        return response()->noContent();
    }

    public function destroy(Request $request, int $id)
    {
        $request->user()
            ->annoncesFavorites()
            ->detach($id);

        return response()->noContent();
    }
}
