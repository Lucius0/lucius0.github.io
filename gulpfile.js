var gulp = require('gulp'),
	less = require('gulp-less'),
	cssmin = require('gulp-minify-css'),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps'),
	babel = require('gulp-babel');

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

gulp.task('es6toes5', function() {
	gulp.src("./_posts/es6-examples/src/*.js")
	    .pipe(babel({
            presets: ['es2015']
        }))
	    .pipe(gulp.dest("./_posts/es6-examples/dist/"));
});

gulp.task('default', function() {
	gulp.watch(paths.styles + "*.less", ['lessTask']);
	gulp.watch("./_posts/es6-examples/src/*.js", ['es6toes5']);
});

