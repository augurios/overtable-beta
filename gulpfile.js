var gulp = require('gulp');
var inject = require('gulp-inject');
var es = require('event-stream');
var concat = require('gulp-concat');
var series = require('stream-series');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var rename = require("gulp-rename");
var sass = require('gulp-sass');
var wiredep = require('wiredep').stream;
var sequence = require('gulp-sequence');
var rename = require('gulp-rename');
var minifyJS = require('gulp-minify');


var distsrc = './public/app/libs/src/'

// Development
gulp.task('bower', function () {
    var files = [
    './vendors/bower_components/jquery/dist/jquery.js',
    './vendors/bower_components/jquery-placeholder/jquery.placeholder.js',
    './vendors/bower_components/bootstrap/dist/js/bootstrap.js',
    './vendors/bower_components/jquery-ui/ui/jquery-ui.js',
    './vendors/bower_components/moment/moment.js',
    './vendors/bower_components/breeze-client/build/breeze.min.js',
    './vendors/bower_components/jquery-bridget/jquery-bridget.js',
    './vendors/bower_components/ev-emitter/ev-emitter.js',
	'./vendors/bower_components/desandro-matches-selector/matches-selector.js',
	'./vendors/bower_components/fizzy-ui-utils/utils.js',
	'./vendors/bower_components/get-size/get-size.js',
	'./vendors/bower_components/outlayer/item.js',
	'./vendors/bower_components/outlayer/outlayer.js',
	'./vendors/bower_components/masonry/masonry.js',
	'./vendors/bower_components/imagesloaded/imagesloaded.js',
    './vendors/bower_components/angular/angular.js',
    './vendors/bower_components/angular-touch/angular-touch.js',
    './vendors/bower_components/angular-animate/angular-animate.js',
    './vendors/bower_components/angular-local-storage/dist/angular-local-storage.js',
    './vendors/bower_components/angular-route/angular-route.js',
    './vendors/bower_components/angular-ui-router/release/angular-ui-router.js',
    './vendors/bower_components/angular-loading-bar/build/loading-bar.js',
    './vendors/bower_components/AngularJS-Toaster/toaster.js',
    './vendors/bower_components/angular-translate/angular-translate.js',
    './vendors/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
    './vendors/bower_components/angular-cookies/angular-cookies.js',
    './vendors/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
    './vendors/bower_components/angular-translate-storage-local/angular-translate-storage-local.js',
    './vendors/bower_components/angular-translate-handler-log/angular-translate-handler-log.js',
    './vendors/bower_components/ng-file-upload/ng-file-upload.js',
    './vendors/bower_components/ng-file-upload-shim/ng-file-upload-shim.js',
    './vendors/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    './vendors/bower_components/pouchdb/dist/pouchdb.min.js',
    './vendors/bower_components/angular-pouchdb/angular-pouchdb.min.js',
    './vendors/bower_components/breeze-client/build/adapters/breeze.bridge.angular.js',
    './vendors/bower_components/bootstrap-material-design/dist/js/material.js',
    './vendors/bower_components/bootstrap-material-design/dist/js/ripples.js',
	'./vendors/bower_components/angular-masonry/angular-masonry.js'
   ];


    return gulp.src(files, { 'base': 'vendors/bower_components/' })
               //.pipe(sourcemaps.init())
               .pipe(uglify({ mangle: false }))
               .pipe(concat('appvendors.js'))
             //  .pipe(sourcemaps.write('./'))
               .pipe(gulp.dest(distsrc)
    );
});
// Development
gulp.task('adddevfiles', function () {

  var target = gulp.src('./public/template/index.html');

  var lib = gulp.src(['./public/app/libs/src/appvendors.js'], {read: false});
  var core = gulp.src(['./public/app/core/*js'], {read: false});
  var constantsfile = gulp.src(['./public/app/constants/*.js'], {read: false});
  var directives = gulp.src(['./public/app/directives/*.js'], {read: false});
  var routes = gulp.src(['./public/app/routes/*.js'], {read: false});
  var controller = gulp.src(['./public/app/controller/*.js'], {read: false});
  var factory = gulp.src(['./public/app/factory/*.js'], {read: false});
  var appModules = gulp.src(['./public/app/modules/**/*.js'], {read: false});
    return target.pipe(inject(series(lib,core,controller,constantsfile,routes,factory,appModules,directives)))
      .pipe(gulp.dest('./public/template/'));
});

// Production
gulp.task('addto', function() {
    var target = gulp.src('./public/template/index.html');
    var lib = gulp.src(['./public/app/libs/src/*.js'], { read: false });
   // var lib = gulp.src(['./public/app/libs/*.js', './public/app/libs/src/*.js'], { read: false });
    return target.pipe(inject(series(lib)))
        .pipe(gulp.dest('./public/template/'));
});


// Dev && Production
gulp.task('styles', function() {
    gulp.src('./public/assets/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/assets/css/'));
});

/*// Dev && Production
gulp.task('combinecss', function() {

});*/


// Production
gulp.task('uglyfy', function () {

var vendorStream = gulp.src([
	'./public/app/core/*.js',
	'./public/app/constants/*.js',
	'./public/app/directives/*.js',
	'./public/app/routes/*.js',
	'./public/app/controller/*.js',
	'./public/app/factory/*.js',
	'./public/app/modules/**/*.js'
	])
  .pipe(concat('library.js'))
  .pipe(ngAnnotate())
  .pipe(rename({ suffix: '.min' }))
  .pipe(uglify({ mangle: true }).on('error', function(e){
            console.log(e);
    }))
  .pipe(gulp.dest(distsrc));
 });

// Main Tasks
gulp.task('build', function(){
  return gulp.src('./public/app/modules/**/*.js')
    .pipe(minifyJS())
    .pipe(concat('concat.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('build.min.js'))
    .pipe(uglify({ mangle: true }).on('error', function(e){
      console.log(e);
    }))
    .pipe(gulp.dest('dist'));
});

// usage:
// 1. run 'bower', 'styles' in parallel;
// 2. run 'adddevfiles' after 'styles' and 'bower';
//
gulp.task('dev', sequence(['bower','styles'], 'adddevfiles'))

gulp.task('production', sequence(['bower','styles','uglyfy'], 'addto'))


/*gulp.task('production', function() {
  gulp.start('bower','uglyfy', 'addto','styles');
})*/
