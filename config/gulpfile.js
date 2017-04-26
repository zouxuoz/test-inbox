const del = require('del');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const paths = require('./paths');

const clean = () => (
  del(paths.buildDir)
);

const buildJs = () => (
  gulp.src([
    '!**/*.test.js',
    paths.jsPattern,
  ])
  .pipe(plumber())
  .pipe(babel())
  .pipe(gulp.dest(paths.buildDir))
);

const watch = () => {
  gulp.watch(paths.jsPattern, buildJs);
};

gulp.task('clean', clean);

gulp.task('build', gulp.series('clean', buildJs));

gulp.task('watch', gulp.series('build', watch));
