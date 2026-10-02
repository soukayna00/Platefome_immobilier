<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'annonce_id', 'user_id', 'date_visite',
    'heure_visite', 'message', 'statut',
])]
class DemandeVisite extends Model
{
    protected $table = 'demande_visites';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'date_visite' => 'date',
            'date_demande' => 'datetime',
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
