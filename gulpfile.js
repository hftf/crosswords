var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var sass = require('gulp-ruby-sass');
var plumber = require('gulp-plumber');

var paths = {
  scripts: ['shared/**/*.coffee', 'client/static/js/**/*.coffee'],
  styles: ['client/static/css/**/*.sass'],
};

gulp.task('scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(plumber())
    .pipe(concat('all.coffee'))
    .pipe(coffee())
    .pipe(gulp.dest('client/static/js'));
});

gulp.task('sass', function () {
  return gulp.src(paths.styles)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('client/static/css'));
});

gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['sass']);
});