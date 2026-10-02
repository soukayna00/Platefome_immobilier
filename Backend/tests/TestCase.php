<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();

        $connection = $app['config']->get('database.default');

        $database = $app['config']->get(
            'database.connections.sqlite.database'
        );

        if ($connection !== 'sqlite' || $database !== ':memory:') {
            throw new RuntimeException(
                'Tests arrêtés : connexion='.$connection
                .', base SQLite='.var_export($database, true)
            );
        }

        return $app;
    }
}
