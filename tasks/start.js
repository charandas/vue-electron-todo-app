'use strict';

const childProcess = require('child_process');
const electron = require('electron');
const gulp = require('gulp');

gulp.task('start', ['build'], () => {
  childProcess
    .spawn(electron, ['.', 'development'], { // argv[2] is development
      stdio: 'inherit'
    })
    .on('close', () => {
          // User closed the app. Kill the host process.
      process.exit();
    });
});
