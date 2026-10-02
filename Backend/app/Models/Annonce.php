<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'bien_id', 'user_id', 'type_transaction', 'prix',
    'statut_annonce', 'date_publication', 'date_expiration',
])]
class Annonce extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'prix' => 'decimal:2',
            'date_publication' => 'date',
            'date_expiration' => 'date',
            'date_creation' => 'datetime',
            'date_modification' => 'datetime',
        ];
    }

    public function bien(): BelongsTo
    {
        return $this->belongsTo(Bien::class);
    }

    public function auteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function utilisateursFavoris(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favoris', 'annonce_id', 'user_id')
            ->using(Favori::class)
            ->withPivot('date_ajout');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function demandesVisite(): HasMany
    {
        return $this->hasMany(DemandeVisite::class);
    }

    public function signalements(): HasMany
    {
        return $this->hasMany(Signalement::class);
    }
}
