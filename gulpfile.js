var gulp = require('gulp'),
	less = require('gulp-less'),
	cssmin = require('gulp-minify-css'),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps');

var paths = {
	styles: [ './_less/']
}

gulp.task('lessTask', function() {
	gulp.src(paths.styles + "main.less")
		.pipe(less())
		.pipe(concat('main.css'))
		.pipe(sourcemaps.init())
		.pipe(cssmin({processImport: false}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./css'));
});

gulp.task('default', function() {
	gulp.watch(paths.styles + "*.less", ['lessTask']);
});