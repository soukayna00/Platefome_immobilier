<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['bien_id', 'url_photo', 'ordre'])]
class Photo extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return ['date_ajout' => 'datetime'];
    }

    public function bien(): BelongsTo
    {
        return $this->belongsTo(Bien::class);
    }
}
