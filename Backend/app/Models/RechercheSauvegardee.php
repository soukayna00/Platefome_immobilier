<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'type_bien_id', 'ville_id',
    'nom_recherche', 'type_transaction',
    'prix_min', 'prix_max', 'surface_min',
    'nbr_chambres_min', 'quartier', 'alerte_active',
])]
class RechercheSauvegardee extends Model
{
    protected $table = 'recherches_sauvegardees';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'prix_min' => 'decimal:2',
            'prix_max' => 'decimal:2',
            'surface_min' => 'decimal:2',
            'alerte_active' => 'boolean',
            'date_creation' => 'datetime',
        ];
    }

    public function utilisateur(): BelongsTo
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
}
