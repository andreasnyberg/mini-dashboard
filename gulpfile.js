var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function() {
	return gulp.src('scss/style.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(autoprefixer())
		.pipe(gulp.dest('css'));
});

gulp.task('default', ['sass'], function() {
	gulp.watch('scss/*.scss', ['sass']);
});