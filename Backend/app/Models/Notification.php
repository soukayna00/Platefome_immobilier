<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'type_notification', 'titre', 'contenu'])]
class Notification extends Model
{
    protected $table = 'notifications_atba';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'date_creation' => 'datetime',
            'date_lecture' => 'datetime',
        ];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
