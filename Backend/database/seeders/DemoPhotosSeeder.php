<?php

namespace Database\Seeders;

use App\Models\Bien;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoPhotosSeeder extends Seeder
{
    public function run(): void
    {
        if (!app()->environment('local')) {
            $this->command->warn(
                'Ce seeder est réservé à l’environnement local.'
            );

            return;
        }

        $images = [
            '[Démo] Appartement lumineux à Malabata' => 'tanger_apartment.webp',
            '[Démo] Appartement familial au Maârif' => 'apartment.webp',
            '[Démo] Appartement avec terrasse à Agdal' => 'apartment.webp',
            '[Démo] Villa avec jardin à Targa' => 'villa.webp',
            '[Démo] Riad traditionnel dans la médina' => 'riad.webp',
            '[Démo] Appartement moderne à Hay Mohammadi' => 'apartment.webp',
            '[Démo] Appartement meublé à Iberia' => 'tanger_apartment.webp',
            '[Démo] Appartement spacieux à Bourgogne' => 'apartment.webp',
            '[Démo] Studio lumineux dans le quartier Hassan' => 'interior.webp',
            '[Démo] Appartement meublé au cœur de Guéliz' => 'apartment.webp',
            '[Démo] Appartement familial aux Mimosas' => 'apartment.webp',
            '[Démo] Appartement confortable au centre de Tétouan' => 'apartment.webp',
        ];

        $count = DB::transaction(function () use ($images) {
            $count = 0;

            $properties = Bien::query()
                ->whereIn('titre', array_keys($images))
                ->get();

            foreach ($properties as $property) {
                // Conserve les photos déjà ajoutées à ce bien.
                if ($property->photos()->exists()) {
                    continue;
                }

                $urls = array_unique([
                    '/images/'.$images[$property->titre],
                    '/images/interior.webp',
                ]);

                foreach (array_values($urls) as $order => $url) {
                    $property->photos()->create([
                        'url_photo' => $url,
                        'ordre' => $order,
                    ]);
                }

                $count++;
            }

            return $count;
        });

        $this->command->info(
            $count.' bien(s) de démonstration ont reçu des photos.'
        );
    }
}
