<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            !$user
            || $user->type_compte !== 'administrateur'
            || $user->statut_compte !== 'actif'
        ) {
            abort(403, 'Accès réservé aux administrateurs actifs.');
        }

        return $next($request);
    }
}
