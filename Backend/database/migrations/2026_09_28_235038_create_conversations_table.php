<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('annonce_id')->constrained('annonces');
            $table->foreignId('proprietaire_id')->constrained('users');
            $table->foreignId('interlocuteur_id')->constrained('users');

            $table->string('statut_conversation', 50)->default('active');
            $table->timestamp('date_creation')->useCurrent();

            $table->unique(
                ['annonce_id', 'interlocuteur_id'],
                'conversations_annonce_interlocuteur_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
