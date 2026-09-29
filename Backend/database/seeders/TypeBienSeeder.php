<?php

namespace Database\Seeders;

use App\Models\TypeBien;
use Illuminate\Database\Seeder;

class TypeBienSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'Appartement',
            'Maison',
            'Villa',
            'Riad',
            'Studio',
            'Terrain',
        ] as $libelle) {
            TypeBien::firstOrCreate(['libelle' => $libelle]);
        }
    }
}
