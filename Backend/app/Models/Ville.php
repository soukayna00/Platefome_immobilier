<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nom_ville'])]
class Ville extends Model
{
    public $timestamps = false;

    public function biens(): HasMany
    {
        return $this->hasMany(Bien::class);
    }

    public function recherchesSauvegardees(): HasMany
    {
        return $this->hasMany(RechercheSauvegardee::class);
    }
}
