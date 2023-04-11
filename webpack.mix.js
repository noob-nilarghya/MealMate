let mix = require('laravel-mix');

// 'node_module/laravel-mix/setup/webpack.mix.js' se cpy karke 'webpack.mix.js' ko root folder pe paste kar diya

// Resources ka JS aur SCSS ko compile karke mujhe finally public ka JS aur CSS mein chahiye
mix.js('resources/js/app.js', 'public/js/app.js').sass('resources/scss/app.scss', 'public/css/app.css');