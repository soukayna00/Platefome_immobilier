<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('name', 'nom');
            $table->string('prenom')->nullable();
            $table->string('telephone', 20)->nullable();
            $table->string('photo_profil')->nullable();
            $table->boolean('telephone_verifie')->default(false);
            $table->string('statut_compte', 50)->default('actif');
            $table->string('type_compte', 50)->default('utilisateur');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'prenom',
                'telephone',
                'photo_profil',
                'telephone_verifie',
                'statut_compte',
                'type_compte',
            ]);
            $table->renameColumn('nom', 'name');
        });
    }
};
