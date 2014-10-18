/*
 * To start I declare several paths to use throughout the gulpfile.
 * This means I only need to declare them in one place. For consistency
 * make sure you always end your paths with a /
 */

var basePaths = {
  src: 'app/',
  dest: 'build/',
  bower: 'bower_components/'
};

var paths = {
  styles: {
    src: basePaths.src + 'css/src/',
    dest: basePaths.src + 'css/build/'
  },
  scripts: {
    src: basePaths.src + 'js/src/',
    dest: basePaths.src + 'js/build/'
  },
  images: {
    src: basePaths.src + 'assets/images/',
    dest: basePaths.src + 'assets/'
  }
};

var files = {
  html: basePaths.src + '*.html',
  bower: basePaths.bower + '**/*',
  assets: basePaths.src + 'assets/**/*',
  styles: paths.styles.src + '**/*.scss',
  scripts: paths.scripts.src + '**/*.js'
};





/*
 * Here 'gulp' is defined along with 'gulp-util'. I also load
 * in 'gulp-load-plugins'. This will search the package.json and
 * install extra plugins.
 */

 var gulp    = require('gulp'),
     gutil   = require('gulp-util'),
     bower   = require('main-bower-files'),
     htmlreplace = require('gulp-html-replace'),
     minifyHTML = require('gulp-minify-html'),
     minifyCSS = require('gulp-minify-css'),
     plugins = require('gulp-load-plugins')();





/*
 * As from this point I declare my gulp tasks. There are two main tasks:
 * 'gulp watch' and 'gulp build'. The former watches all our css and javascript
 * and concatenates it, but keeps formatting intact so it's easy to debug.
 * the latter makes a compressed copy ready to ship to a server.
 */

gulp.task('styles', function() {
  gulp.src(files.styles)
    .pipe(plugins.compass({
      config_file: basePaths.src + 'css/config.rb',
      sass: paths.styles.src,
      css: paths.styles.dest,
      style: 'expanded',
      require: ['sass-globbing', 'susy', 'breakpoint']
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(plugins.notify({
      message: 'Styles task complete'
    }));
});

gulp.task('scripts', function() {
  gulp.src(files.scripts)
    .pipe(plugins.concat('src.js'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(plugins.notify({
      message: 'Scripts task complete'
    }));
});

gulp.task('bower', function() {
  gulp.src(bower())
    .pipe(plugins.concat('bower.js'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(plugins.notify({
      message: 'Bower task complete'
    }));
});

gulp.task('images', function() {
  gulp.src(paths.images.src)
    .pipe(plugins.cache(
      plugins.imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
      })
    ))
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('validate', function() {
  gulp.src(files.html)
    .pipe(plugins.w3cjs())
    .pipe(plugins.notify({
      message: 'Validate task complete'
    }));
});

gulp.task('clean', function() {
  return gulp.src(basePaths.dest, {read: false})
    .pipe(plugins.clean());
});

/* The watch task */
gulp.task('watch', function() {
  gulp.watch(files.styles, ['styles']);
  gulp.watch(files.scripts, ['scripts']);
  gulp.watch(files.bower, ['bower']);
});

/* The build task */
gulp.task('build', ['clean', 'images'], function() {
  gulp.src(basePaths.src + '.htaccess')
    .pipe(gulp.dest(basePaths.dest));

  gulp.src(files.assets)
    .pipe(gulp.dest(basePaths.dest + 'assets'));

  gulp.src(files.html)
    .pipe(htmlreplace({
      'css': 'css/base.min.css',
      'js' : 'js/build.min.js'
    }))
    .pipe(minifyHTML({
      empty: true,
      comments: true,
      conditionals: true
    }))
    .pipe(gulp.dest(basePaths.dest));

  gulp.src(paths.styles.dest + '*.css')
    .pipe(minifyCSS())
    .pipe(plugins.rename('base.min.css'))
    .pipe(gulp.dest(basePaths.dest + 'css'));

  gulp.src(paths.scripts.dest + '*.js')
    .pipe(plugins.concat('build.min.js'))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(basePaths.dest + 'js'));
});

/* The default task */
gulp.task('default', ['scripts', 'bower', 'styles', 'watch']);
