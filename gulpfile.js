/**
 * Comentanto funciones usando estilo JSDoc http://usejsdoc.org/
 * gulp - Automatizador flujo de trabajo en el front-End
 * webserver -  https://www.npmjs.com/package/gulp-webserver
 */
var gulp = require('gulp')
var webserver = require('gulp-webserver')

gulp.task('webserver', function() {
    gulp.src('app')
        .pipe(webserver({
            host: 'localhost',
            port: 3000,
            livereload: true,
            directoryListing: false,
            open: true,
            proxies: [{
                source: '/arcgis',
                target: 'http://192.168.69.69:80/arcgis',
                options: {
                    headers: {
                        'DEVELOPER': 'juusechec'
                    }
                }
            }]
        }))
})

/*
//https://www.youtube.com/watch?v=TGiBG6II6Jk
gulp.task('watch', ['sass'], function (){
  gulp.watch('./sass/**\/*.css', ['sass'])
});
*/

//https://github.com/andresvia/go-angular-drone/blob/master/.drone.yml
gulp.task('default', ['webserver'], function() {
    // place code for your default task here
})
