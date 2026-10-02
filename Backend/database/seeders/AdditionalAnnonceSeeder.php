<?php

namespace Database\Seeders;

use App\Models\Bien;
use App\Models\TypeBien;
use App\Models\User;
use App\Models\Ville;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AdditionalAnnonceSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->table(
            ['ID', 'Nom', 'Prénom'],
            User::query()
                ->where('type_compte', 'utilisateur')
                ->where('statut_compte', 'actif')
                ->get(['id', 'nom', 'prenom'])
                ->toArray()
        );

        $ownerId = $this->command->ask(
            'Quel ID utilisateur sera propriétaire des biens de démonstration ?'
        );

        $owner = User::query()
            ->where('type_compte', 'utilisateur')
            ->where('statut_compte', 'actif')
            ->find($ownerId);

        if (!$owner) {
            throw new RuntimeException(
                'Choisissez l’ID d’un compte utilisateur actif.'
            );
        }

        // Transaction, ville, quartier, type, titre,
        // surface, chambres, salles de bain, prix.
        $properties = [
            [
                'vente', 'Tanger', 'Malabata', 'Appartement',
                'Appartement lumineux à Malabata',
                110, 3, 2, 1650000,
            ],
            [
                'vente', 'Casablanca', 'Maârif', 'Appartement',
                'Appartement familial au Maârif',
                135, 3, 2, 2100000,
            ],
            [
                'vente', 'Rabat', 'Agdal', 'Appartement',
                'Appartement avec terrasse à Agdal',
                95, 2, 2, 1750000,
            ],
            [
                'vente', 'Marrakech', 'Targa', 'Villa',
                'Villa avec jardin à Targa',
                280, 4, 3, 3800000,
            ],
            [
                'vente', 'Fès', 'Médina', 'Riad',
                'Riad traditionnel dans la médina',
                190, 4, 3, 2400000,
            ],
            [
                'vente', 'Agadir', 'Hay Mohammadi', 'Appartement',
                'Appartement moderne à Hay Mohammadi',
                85, 2, 1, 890000,
            ],
            [
                'location', 'Tanger', 'Iberia', 'Appartement',
                'Appartement meublé à Iberia',
                90, 2, 1, 5500,
            ],
            [
                'location', 'Casablanca', 'Bourgogne', 'Appartement',
                'Appartement spacieux à Bourgogne',
                115, 3, 2, 7500,
            ],
            [
                'location', 'Rabat', 'Hassan', 'Studio',
                'Studio lumineux dans le quartier Hassan',
                42, 1, 1, 3800,
            ],
            [
                'location', 'Marrakech', 'Guéliz', 'Appartement',
                'Appartement meublé au cœur de Guéliz',
                78, 2, 1, 6000,
            ],
            [
                'location', 'Kénitra', 'Mimosas', 'Appartement',
                'Appartement familial aux Mimosas',
                100, 3, 2, 4200,
            ],
            [
                'location', 'Tétouan', 'Centre-ville', 'Appartement',
                'Appartement confortable au centre de Tétouan',
                82, 2, 1, 3200,
            ],
        ];

        DB::transaction(function () use ($owner, $properties) {
            foreach ($properties as $item) {
                [
                    $transaction,
                    $cityName,
                    $quarter,
                    $typeLabel,
                    $title,
                    $area,
                    $bedrooms,
                    $bathrooms,
                    $price,
                ] = $item;

                $city = Ville::firstOrCreate([
                    'nom_ville' => $cityName,
                ]);

                $type = TypeBien::firstOrCreate([
                    'libelle' => $typeLabel,
                ]);

                $property = Bien::firstOrCreate(
                    [
                        'user_id' => $owner->id,
                        'titre' => '[Démo] '.$title,
                    ],
                    [
                        'ville_id' => $city->id,
                        'type_bien_id' => $type->id,
                        'description' =>
                            "Bien fictif utilisé pour présenter la plateforme ATBA.\n\n"
                            .$title.' dans le quartier '.$quarter.'. '
                            .'Surface de '.$area.' m², '
                            .$bedrooms.' chambre(s) et '
                            .$bathrooms.' salle(s) de bain. '
                            .'Les caractéristiques et le prix sont illustratifs.',
                        'surface' => $area,
                        'nbr_chambres' => $bedrooms,
                        'nbr_salle_bain' => $bathrooms,
                        'etage' => in_array($typeLabel, ['Villa', 'Riad'])
                            ? null
                            : 2,
                        'parking' => $typeLabel !== 'Riad',
                        'ascenseur' => $typeLabel === 'Appartement',
                        'etat_bien' => 'Bon état',
                        'adresse_approx' => $quarter.', '.$cityName,
                        'quartier' => $quarter,
                    ]
                );

                $property->annonces()->firstOrCreate(
                    [
                        'user_id' => $owner->id,
                        'type_transaction' => $transaction,
                    ],
                    [
                        'prix' => $price,
                        'statut_annonce' => 'publiee',
                        'date_publication' => today()->toDateString(),
                    ]
                );
            }
        });

        $this->command->info(
            'Les 12 annonces de démonstration sont disponibles.'
        );
    }
}
