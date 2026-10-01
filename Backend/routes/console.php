<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;


Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


\Illuminate\Support\Facades\Artisan::command('admin:create', function () {
    $prenom = trim((string) $this->ask('Prénom'));
    $nom = trim((string) $this->ask('Nom'));
    $email = strtolower(trim((string) $this->ask('Email admin')));

    $password = $this->secret('Mot de passe (12 caractères minimum)');
    $confirmation = $this->secret('Confirmer le mot de passe');

    $validator = \Illuminate\Support\Facades\Validator::make(
        [
            'prenom' => $prenom,
            'nom' => $nom,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $confirmation,
        ],
        [
            'prenom' => ['required', 'string', 'max:255'],
            'nom' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:12',
                'max:256',
                'confirmed',
            ],
        ]
    );

    if ($validator->fails()) {
        foreach ($validator->errors()->all() as $message) {
            $this->error($message);
        }

        return 1;
    }

    $admin = new \App\Models\User();

    $admin->prenom = $prenom;
    $admin->nom = $nom;
    $admin->email = $email;
    $admin->password = \Illuminate\Support\Facades\Hash::make($password);
    $admin->type_compte = 'administrateur';
    $admin->statut_compte = 'actif';

    $admin->save();

    $this->info('Compte administrateur créé : '.$admin->email);

    return 0;
})->purpose('Créer un compte administrateur dédié');
