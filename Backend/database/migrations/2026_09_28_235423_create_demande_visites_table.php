<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demande_visites', function (Blueprint $table) {
            $table->id();

            $table->foreignId('annonce_id')->constrained('annonces');
            $table->foreignId('user_id')->constrained('users');

            $table->date('date_visite');
            $table->time('heure_visite');
            $table->text('message')->nullable();
            $table->string('statut', 50)->default('en_attente');
            $table->timestamp('date_demande')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_visites');
    }
};
