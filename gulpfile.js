// plugins
var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    notify      = require('gulp-notify'),
    compass     = require('gulp-compass'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    bower       = require('main-bower-files'),
    cache       = require('gulp-cache'),
    imagemin    = require('gulp-imagemin'),
    clean       = require('gulp-clean'),
    htmlreplace = require('gulp-html-replace'),
    rename      = require('gulp-rename'),
    minifyCSS   = require('gulp-minify-css'),
    minifyHTML  = require('gulp-minify-html')
    w3cjs       = require('gulp-w3cjs');



// Set up base paths
var paths = {
  styles  : 'app/css/**/*.scss',
  scripts : 'app/js/src/**/*.js',
  bower   : 'bower_components/**/*',
  images  : 'app/assets/images/**/*'
};



// SASS task
gulp.task('styles', function() {
  gulp.src('app/css/src/base.scss')
    .pipe(compass({
      config_file: 'app/css/config.rb',
      css: 'app/css/build',
      sass: 'app/css/src',
      style: 'expanded',
      require: ['sass-globbing', 'susy', 'breakpoint']
    }))
    .pipe(gulp.dest('app/css/build'))
    .pipe(notify({
      message: 'Styles task complete'
    }));
});



// Concat all bower files
gulp.task('bower', function() {
  gulp.src(bower())
    .pipe(concat('bower.js'))
    .pipe(gulp.dest('app/js/build'))
    .pipe(notify({
      message: 'Bower task complete'
    }));
});



// Concat all javascript files
gulp.task('scripts', function() {
  gulp.src(paths.scripts)
    .pipe(concat('src.js'))
    .pipe(gulp.dest('app/js/build'))
    .pipe(notify({
      message: 'Scripts task complete'
    }));
});



// Optimize all images
gulp.task('images', function() {
  gulp.src(paths.images)
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('app/assets/images'))
    .pipe(notify({
      message: 'Images task complete'
    }));
});

// Clean
gulp.task('clean', function () {
  return gulp.src('./build', {read: false})
    .pipe(clean());
});



// The DEFAULT task
gulp.task('default', ['styles', 'scripts', 'bower', 'watch']);



// The WATCH task
gulp.task('watch', function() {
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.bower, ['bower']);
});


// The VALIDATE task
gulp.task('validate', function() {
  gulp.src('app/*.html')
    .pipe(w3cjs());
});



// The BUILD task
gulp.task('build', ['clean'], function() {
  gulp.src('app/.htaccess')
    .pipe(gulp.dest('./build'));

  gulp.src('app/assets/**/*')
    .pipe(gulp.dest('./build/assets'));

  gulp.src('app/*.html')
    .pipe(htmlreplace({
      'css': 'css/base.min.css',
      'js' : 'js/build.min.js'
    }))
    .pipe(minifyHTML({
      empty: true,
      comments: true,
      conditionals: true
    }))
    .pipe(gulp.dest('./build'));

  gulp.src('app/css/build/*.css')
    .pipe(minifyCSS())
    .pipe(rename('base.min.css'))
    .pipe(gulp.dest('./build/css'));

  gulp.src('app/js/build/*.js')
    .pipe(concat('build.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});
