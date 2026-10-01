<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $authenticated = Auth::guard('web')->attempt([
            'email' => $data['email'],
            'password' => $data['password'],
            'type_compte' => 'administrateur',
            'statut_compte' => 'actif',
        ]);

        if (!$authenticated) {
            throw ValidationException::withMessages([
                'email' => [
                    'Identifiants incorrects ou accès administrateur non autorisé.',
                ],
            ]);
        }

        $request->session()->regenerate();

        return response()->noContent();
    }
}
