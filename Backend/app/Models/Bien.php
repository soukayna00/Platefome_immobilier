<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id', 'type_bien_id', 'ville_id', 'titre', 'description',
    'surface', 'nbr_chambres', 'nbr_salle_bain', 'etage',
    'parking', 'ascenseur', 'etat_bien', 'adresse_approx',
    'quartier', 'latitude', 'longitude',
])]
class Bien extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'surface' => 'decimal:2',
            'parking' => 'boolean',
            'ascenseur' => 'boolean',
            'latitude' => 'decimal:6',
            'longitude' => 'decimal:6',
            'created_at' => 'datetime',
        ];
    }

    public function proprietaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function typeBien(): BelongsTo
    {
        return $this->belongsTo(TypeBien::class);
    }

    public function ville(): BelongsTo
    {
        return $this->belongsTo(Ville::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class)->orderBy('ordre');
    }

    public function annonces(): HasMany
    {
        return $this->hasMany(Annonce::class);
    }
}
