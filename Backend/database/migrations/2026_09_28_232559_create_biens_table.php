<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biens', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('type_bien_id')->constrained('type_biens');
            $table->foreignId('ville_id')->constrained('villes');

            $table->string('titre');
            $table->text('description')->nullable();
            $table->decimal('surface', 10, 2);
            $table->unsignedInteger('nbr_chambres')->default(0);
            $table->unsignedInteger('nbr_salle_bain')->default(0);
            $table->integer('etage')->nullable();
            $table->boolean('parking')->default(false);
            $table->boolean('ascenseur')->default(false);
            $table->string('etat_bien', 50)->nullable();
            $table->string('adresse_approx')->nullable();
            $table->string('quartier', 100)->nullable();
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biens');
    }
};
