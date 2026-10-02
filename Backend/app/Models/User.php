<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'nom', 'prenom', 'email', 'telephone', 'password',
    'photo_profil', 'telephone_verifie', 'statut_compte', 'type_compte',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'telephone_verifie' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function biens(): HasMany
    {
        return $this->hasMany(Bien::class);
    }

    public function annonces(): HasMany
    {
        return $this->hasMany(Annonce::class);
    }

    public function annoncesFavorites(): BelongsToMany
    {
        return $this->belongsToMany(Annonce::class, 'favoris', 'user_id', 'annonce_id')
            ->using(Favori::class)
            ->withPivot('date_ajout');
    }

    public function demandesVisite(): HasMany
    {
        return $this->hasMany(DemandeVisite::class);
    }

    public function signalements(): HasMany
    {
        return $this->hasMany(Signalement::class);
    }

    public function recherchesSauvegardees(): HasMany
    {
        return $this->hasMany(RechercheSauvegardee::class);
    }

    public function notificationsAtba(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function messagesEnvoyes(): HasMany
    {
        return $this->hasMany(Message::class, 'expediteur_id');
    }

    public function conversationsProprietaire(): HasMany
    {
        return $this->hasMany(Conversation::class, 'proprietaire_id');
    }

    public function conversationsInterlocuteur(): HasMany
    {
        return $this->hasMany(Conversation::class, 'interlocuteur_id');
    }
}
