<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'annonce_id',
    'proprietaire_id',
    'interlocuteur_id',
    'statut_conversation',
])]
class Conversation extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return ['date_creation' => 'datetime'];
    }

    public function annonce(): BelongsTo
    {
        return $this->belongsTo(Annonce::class);
    }

    public function proprietaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proprietaire_id');
    }

    public function interlocuteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interlocuteur_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
