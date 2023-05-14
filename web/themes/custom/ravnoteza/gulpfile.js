'use strict';

var config = require('./config.js');
var path = require('path');
var upath = require('upath');
var extend = require('extend');
var browserSync = require('browser-sync');
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var sassGlob = require('gulp-sass-glob');
var gutil = require("gulp-util");
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var drupalBreakpoints = require('drupal-breakpoints-scss');
var tap = require('gulp-tap');
var reload = browserSync.reload;

var themePath = '/themes/studiopresent/' + config.theme + '/css/';
var sassCfg = config.sass;
var autoprefixerCfg = config.autoprefixer;
var bsCfg = config.browserSync;

// find destination folder for the requested file
function findDest(vf, p) {
  var found = false;
  var dest = '';

  for (var i = 0, len = p.length; i < len; i++) {
    if (upath.normalize(vf.path).indexOf(p[i]) !== -1) {
      dest = external.dest[i];
      found = true;
      break;
    }
  }
  return dest;
}


// Error notify
var reportError = function (error) {
  var lineNumber = (error.lineNumber) ?
    'LINE ' + error.lineNumber + ' -- ' :
    '';
  var report = '';
  var chalk = gutil.colors.white.bgRed;
  report += chalk('TASK:') + ' [' + error.plugin + ']\n';
  report += chalk('PROB:') + ' ' + error.message + '\n';
  if (error.lineNumber) {
    report += chalk('LINE:') + ' ' + error.lineNumber + '\n';
  }
  if (error.fileName) {
    report += chalk('FILE:') + ' ' + error.fileName + '\n';
  }
  console.error(report);
  // Prevent the 'watch' task from stopping
  this.emit('end');
};


// task for building production version css
// * autoprefixer
gulp.task('sass:prod', function () {
  return gulp
    .src(sassCfg.src)
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(sass({
      sourceComments: false
    }).on('error', sass.logError))
    .on('error', reportError)
    .pipe(autoprefixer(autoprefixerCfg))
    .pipe(cleanCSS({
      compatibility: 'ie10'
    }))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(sassCfg.dest))
    .pipe(tap(function (f, t) {
      if (path.extname(f.path) === '.css') {
        gulp
          .src(f.path)
          .pipe(reload({
            stream: true
          }));
      }
    }));
});

gulp.task('browsersync', function () {
  var bsConfig = extend(true, {}, bsCfg, {
    rewriteRules: [{
      match: new RegExp(themePath, 'g'),
      fn: function (match) {
        var path = sassCfg.dest,
          startsWith = sassCfg
            .dest
            .substr(0, 1);

        if (startsWith === '.') {
          path = sassCfg
            .dest
            .slice(1);
        } else if (startsWith !== '/') {
          path = '/' + sassCfg.dest;
        }

        return path;
      }
    }]
  });
  browserSync(bsConfig);
  if (sassCfg.enable) {
    gulp.watch(sassCfg.src, gulp.series('sass:prod'));
  }
});

// run browser sync and watch for changes
gulp.task('serve',
  gulp.series('sass:prod', 'browsersync')
);

// task for building breakpoint scss in variables
gulp.task('breakpoint', function () {
  return gulp
    .pipe(drupalBreakpoints.ymlToScss())
    .pipe(rename('_breakpoints.scss'))
    .pipe(gulp.dest('./scss/variables/'))
});

// default gulp task
gulp.task('default',
  gulp.series('serve'));
