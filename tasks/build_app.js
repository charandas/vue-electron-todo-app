'use strict';

const gulp = require('gulp');
// const watch = require('gulp-watch');
// const batch = require('gulp-batch');
const jetpack = require('fs-jetpack');

const bundle = require('./bundle');
const utils = require('./utils');

const srcDir = jetpack.cwd('./src');
const destDir = jetpack.cwd('./app');
const configDir = jetpack.cwd('./config');

gulp.task('bundle', () => (
  bundle(srcDir.path('background.js'), destDir.path('background.js'))
));

function copyConfig () {
  if (utils.getEnvName() === 'production') {
    return jetpack.writeAsync(configDir.path('local.json'), { NODE_ENV: 'production' });
  }

  return false;
}

// Copy config
gulp.task('environment', () => copyConfig());
gulp.task('build', ['environment', 'bundle']);
