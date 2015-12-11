var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    mix.sass('app.scss', 'resources/assets/css')
        .browserify('app.js')
        .scripts([
         'libs/jquery-2.1.4.js',
         'libs/bootstrap.min.js',
         'libs/vue.js',
         'libs/vue-router.js',
        ], 'public/js/vendor.js')
        .styles([
         'libs/bootstrap.css',
         'app.css'
        ]);
});
