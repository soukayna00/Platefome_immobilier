<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Vous devez être connecté.');
        }

        if ($user->statut_compte !== 'actif') {
            abort(
                403,
                'Votre compte est suspendu. Contactez l’administration.'
            );
        }

        return $next($request);
    }
}
