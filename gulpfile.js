'use strict';

//inspired by the gulpfile.js from https://github.com/martinmicunda/employee-scheduling-ui

/**
 * Load required dependencies.
 */
var pkg = require('./package.json');
var gulp = require('gulp');
var modRewrite = require('connect-modrewrite');
var browserSync = require('browser-sync');

/**
 * Load Gulp plugins listed in 'package.json' and attaches
 * them to the `$` variable.
 */
var $ = require('gulp-load-plugins')();

//=============================================
//   !!!FEEL FREE TO EDIT THESE VARIABLES!!!
//=============================================

var PRODUCTION_URL       = 'http://your-production-url.com';//@todo check
var DEVELOPMENT_URL      = 'http://127.0.0.1:9000';
var PRODUCTION_CDN_URL   = 'http://topheman.github.io/angular-es6-jspm/dist/';//@todo check

//=============================================
//            DECLARE VARIABLES
//=============================================

var log = $.util.log;
var argv = $.util.env;
var ENV = !!argv.env ? argv.env : 'dev';
var COLORS = $.util.colors;
//bellow used for e2e testing
var BROWSERS = !!argv.browsers ? argv.browsers : 'PhantomJS';
var CDN_BASE = !!argv.cdn ? PRODUCTION_CDN_URL : DEVELOPMENT_URL;
var APPLICATION_BASE_URL = ENV ? PRODUCTION_URL : DEVELOPMENT_URL;

//=============================================
//            UTILS FUNCTIONS
//=============================================

/*var proxyTarget = 'http://localhost:9000/';
 var proxyApiPrefix = 'api';
 var proxy = httpProxy.createProxyServer({
 target: proxyTarget
 });

 var proxyMiddleware = function(req, res, next) {
 if (req.url.indexOf(proxyApiPrefix) !== -1) {
 proxy.web(req, res);
 } else {
 next();
 }
 };*/

function startBrowserSync(baseDir, files, browser) {
  browser = browser === undefined ? 'default' : browser;
  files = files === undefined ? 'default' : files;

  browserSync({
    files: files,
    port: 9000,
    notify: false,
    server: {
      baseDir: baseDir,
      middleware: [
        //proxyMiddleware,
        modRewrite(['!\\.\\w+$ /index.html [L]']) // require for HTML5 mode
      ]
    },
    browser: browser
  });
}

//=============================================
//            DECLARE PATHS
//=============================================

var paths = {
  gulpfile: 'gulpfile.js',
  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks.
   *
   * - 'styles'       contains all project css styles
   * - 'images'       contains all project images
   * - 'fonts'        contains all project fonts
   * - 'scripts'      contains all project javascript except config-env.js and unit test files
   * - 'html'         contains main html files
   * - 'templates'    contains all project html templates
   * - 'config'       contains Angular app config files - @todo not sure for the moment
   */
  app: {
    basePath: 'src/',
    fonts: [
      'src/fonts/**/*.{eot,svg,ttf,woff}',
      'jspm_packages/**/*.{eot,svg,ttf,woff}'
    ],
    styles: 'src/styles/**/*.scss',
    images: 'src/images/**/*.{png,gif,jpg,jpeg}',
    scripts: [
      'src/app/**/*.js',
      '!src/app/**/*.spec.js'
    ],
    html: 'src/index.html',
    templates: 'src/app/**/*.html'
  },
  /**
   * The 'tmp' folder is where our html templates are compiled to JavaScript during
   * the build process and then they are concatenating with all other js files and
   * copy to 'dist' folder.
   */
  tmp: {
    basePath: '.tmp/',
    styles: '.tmp/styles/',
    scripts: '.tmp/scripts/'
  }
};

//=============================================
//               SUB TASKS
//=============================================

/**
 * The 'jshint' task defines the rules of our hinter as well as which files
 * we should check. It helps to detect errors and potential problems in our
 * JavaScript code.
 */
gulp.task('jshint', function () {
  return gulp.src(paths.app.scripts.concat(paths.gulpfile))
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

/**
 * The 'htmlhint' task defines the rules of our hinter as well as which files we
 * should check. It helps to detect errors and potential problems in our
 * HTML code.
 * @todo
 */
gulp.task('htmlhint', function () {
  process.stdout.write('TODO htmlhint\n');
});

/**
 * Compile SASS files into the main.css.
 */
gulp.task('sass', function () {
  // if it's set to `true` the gulp.watch will keep gulp from stopping
  // every time we mess up sass files
  var errLogToConsole = ENV === 'dev' || ENV === 'test';
  return gulp.src(paths.app.styles)
    .pipe($.changed(paths.tmp.styles, {extension: '.scss'}))
    .pipe($.sourcemaps.init())
    .pipe($.sass({style: 'compressed', errLogToConsole: errLogToConsole}))
    .pipe($.autoprefixer('last 2 version'))
    .pipe($.concat('main.css'))
    .pipe($.sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.tmp.styles))
    .pipe($.filter('**/*.css')) // Filtering stream to only css files
    .pipe(browserSync.reload({stream: true}));
});

/**
 * The 'watch' task set up the checks to see if any of the files listed below
 * change, and then to execute the listed tasks when they do.
 */
gulp.task('watch', function () {
  // Watch images and fonts files
  gulp.watch([paths.app.images, paths.app.fonts], [browserSync.reload]);

  // Watch css files
  gulp.watch(paths.app.styles, ['sass']);

  // Watch js files
  gulp.watch([paths.app.scripts, paths.gulpfile], ['jshint', browserSync.reload]);

  // Watch html files
  gulp.watch([paths.app.html, paths.app.templates], ['htmlhint', browserSync.reload]);
});

//=============================================
//                MAIN TASKS
//=============================================

//---------------------------------------------
//              DEVELOPMENT TASKS
//---------------------------------------------

/**
 * The 'serve' task serve the dev environment.
 */
gulp.task('serve', ['sass', 'watch'], function () {
  startBrowserSync(['.tmp', 'src', 'jspm_packages', './']);
});
gulp.task('default', ['serve']);