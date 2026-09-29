<?php

namespace Database\Seeders;

use App\Models\Ville;
use Illuminate\Database\Seeder;

class VilleSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'Tanger',
            'Casablanca',
            'Rabat',
            'Marrakech',
            'Fès',
        ] as $nomVille) {
            Ville::firstOrCreate(['nom_ville' => $nomVille]);
        }
    }
}
