<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications_atba', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('type_notification', 50);
            $table->string('titre');
            $table->text('contenu');
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_lecture')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications_atba');
    }
};
