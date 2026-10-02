<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();

            $table->foreignId('bien_id')->constrained('biens');
            $table->foreignId('user_id')->constrained('users');

            $table->string('type_transaction', 20);
            $table->decimal('prix', 12, 2);
            $table->string('statut_annonce', 50)->default('brouillon');

            $table->date('date_publication')->nullable();
            $table->date('date_expiration')->nullable();
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_modification')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annonces');
    }
};
