<?php

namespace Database\Seeders;

use App\Models\Annonce;
use App\Models\Bien;
use App\Models\Photo;
use App\Models\TypeBien;
use App\Models\User;
use App\Models\Ville;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoAnnonceSeeder extends Seeder
{
    public function run(): void
    {
        // Données de démonstration réservées à l'environnement local.
        if (! app()->environment('local')) {
            return;
        }

        $utilisateur = User::firstOrCreate(
            ['email' => 'demo@atba.invalid'],
            [
                'nom' => 'ATBA',
                'prenom' => 'Démo',
                'password' => Str::random(48),
                'statut_compte' => 'actif',
                'type_compte' => 'utilisateur',
            ]
        );

        $ville = Ville::firstOrCreate(['nom_ville' => 'Tanger']);
        $type = TypeBien::firstOrCreate(['libelle' => 'Appartement']);

        $bien = Bien::firstOrCreate(
            [
                'user_id' => $utilisateur->id,
                'titre' => 'Appartement lumineux à Malabata',
            ],
            [
                'ville_id' => $ville->id,
                'type_bien_id' => $type->id,
                'description' => 'Appartement lumineux avec terrasse à Tanger.',
                'surface' => 95,
                'nbr_chambres' => 2,
                'nbr_salle_bain' => 1,
                'etage' => 3,
                'parking' => true,
                'ascenseur' => true,
                'etat_bien' => 'bon_etat',
                'adresse_approx' => 'Malabata, Tanger',
                'quartier' => 'Malabata',
            ]
        );

        $annonce = Annonce::firstOrCreate(
            [
                'bien_id' => $bien->id,
                'type_transaction' => 'location',
            ],
            [
                'user_id' => $utilisateur->id,
                'prix' => 10500,
                'statut_annonce' => 'publiee',
                'date_publication' => today(),
            ]
        );

        Photo::firstOrCreate(
            [
                'bien_id' => $bien->id,
                'url_photo' => '/images/tanger_apartment.webp',
            ],
            ['ordre' => 0]
        );
    }
}
