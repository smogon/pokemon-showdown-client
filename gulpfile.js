const { src, dest } = require('gulp');

function streamTask() {
  return src([
    'audio/**/*.mp3',
    'config/config.js',
    'data/*.js',
    'fx/**/*',
    'js/**/*',
    'sprites/**/*',
    'style/**/*',
    'swf/**/*',
    'apple-touch-icon.png',
    'favicon*',
    'index.html',
    'cache.manifest',
    'manifest.json',
    'pokemonshowdown*.png',
    'robots.txt',
    'showdown.crx',
    'showdown.webapp',
  ], { base: __dirname })
  .pipe(dest('public'));
}

exports.default = streamTask;
