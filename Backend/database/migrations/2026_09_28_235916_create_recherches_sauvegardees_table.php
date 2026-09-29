<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recherches_sauvegardees', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('type_bien_id')
                ->nullable()
                ->constrained('type_biens')
                ->nullOnDelete();

            $table->foreignId('ville_id')
                ->nullable()
                ->constrained('villes')
                ->nullOnDelete();

            $table->string('nom_recherche', 100);
            $table->string('type_transaction', 20)->nullable();
            $table->decimal('prix_min', 12, 2)->nullable();
            $table->decimal('prix_max', 12, 2)->nullable();
            $table->decimal('surface_min', 10, 2)->nullable();
            $table->unsignedInteger('nbr_chambres_min')->nullable();
            $table->string('quartier', 100)->nullable();
            $table->boolean('alerte_active')->default(false);
            $table->timestamp('date_creation')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recherches_sauvegardees');
    }
};
