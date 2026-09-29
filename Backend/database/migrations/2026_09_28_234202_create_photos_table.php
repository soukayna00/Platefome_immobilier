<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bien_id')->constrained('biens')->cascadeOnDelete();
            $table->string('url_photo');
            $table->unsignedInteger('ordre')->default(0);
            $table->timestamp('date_ajout')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
