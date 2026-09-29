<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['annonce_id', 'user_id', 'motif', 'description', 'statut'])]
class Signalement extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'date_signalement' => 'datetime',
            'date_traitement' => 'datetime',
        ];
    }

    public function annonce(): BelongsTo
    {
        return $this->belongsTo(Annonce::class);
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
