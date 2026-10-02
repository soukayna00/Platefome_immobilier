<?php

namespace Database\Seeders;

use App\Models\Ville;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VilleSeeder extends Seeder
{
    public function run(): void
    {
        $villes = [
            'Agadir',
            'Al Hoceïma',
            'Asilah',
            'Azemmour',
            'Azrou',
            'Béni Mellal',
            'Benslimane',
            'Berkane',
            'Berrechid',
            'Boujdour',
            'Boulemane',
            'Casablanca',
            'Chefchaouen',
            'Dakhla',
            'Demnate',
            'El Hajeb',
            'El Jadida',
            'Errachidia',
            'Essaouira',
            'Fès',
            'Figuig',
            'Fnideq',
            'Guelmim',
            'Guercif',
            'Ifrane',
            'Imzouren',
            'Jerada',
            'Kénitra',
            'Khémisset',
            'Khénifra',
            'Khouribga',
            'Ksar El Kébir',
            'Laâyoune',
            'Larache',
            'Marrakech',
            'Martil',
            'M’diq',
            'Meknès',
            'Midelt',
            'Mohammédia',
            'Nador',
            'Ouarzazate',
            'Ouezzane',
            'Oujda',
            'Rabat',
            'Safi',
            'Salé',
            'Sefrou',
            'Settat',
            'Sidi Bennour',
            'Sidi Ifni',
            'Sidi Kacem',
            'Sidi Slimane',
            'Skhirat',
            'Tan-Tan',
            'Tanger',
            'Taounate',
            'Taourirt',
            'Taroudant',
            'Tata',
            'Taza',
            'Témara',
            'Tétouan',
            'Tinghir',
            'Tiznit',
            'Youssoufia',
            'Zagora',
        ];

        DB::transaction(function () use ($villes) {
            foreach ($villes as $nomVille) {
                Ville::firstOrCreate([
                    'nom_ville' => $nomVille,
                ]);
            }
        });
    }
}
