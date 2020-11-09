var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    ftp = require('vinyl-ftp'),
    notify = require("gulp-notify"),
    rsync = require('gulp-rsync'),
    cssbeautify = require('gulp-cssbeautify'),
    // pug = require('gulp-pug'),
    plumber = require('gulp-plumber'),
    imgRetina = require('gulp-img-retina');



gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false
    });
});

// Пользовательские скрипты проекта

gulp.task('common-js', function() {
    return gulp.src([
            'app/js/common.js',
        ])
        .pipe(concat('common.min.js'))
        // .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});

// gulp.task('pug', function() {
//     return gulp.src('app/pug/**/*.pug')
//         .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
//         .pipe(pug({
//             pretty: true
//         }))
//         .pipe(gulp.dest('app'))
// })

gulp.task('js', ['common-js'], function() {
    return gulp.src([
            'app/libs/jquery/dist/jquery.min.js',
            'app/js/common.min.js', // Всегда в конце
        ])
        .pipe(concat('scripts.min.js'))
        // .pipe(uglify()) // Минимизировать весь js (на выбор)
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('css', function() {
    return gulp.src('app/css/*.css')
        .pipe(cssbeautify({
            indent: '  ',
            openbrace: 'separate-line',
            autosemicolon: true
        }))
        .pipe(gulp.dest('app/css'));
});

gulp.task('sass', function() {
    return gulp.src('app/sass/**/*.sass')
        .pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
        .pipe(rename({ suffix: '.min', prefix: '' }))
        .pipe(autoprefixer(['last 15 versions']))
        // .pipe(cleanCSS()) // Опционально, закомментировать при отладке
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream())
});

gulp.task('watch', ['css', 'sass', 'js', 'browser-sync'], function() {
    gulp.watch('app/sass/**/*.sass', ['sass']);
    gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
    gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('retina', function() {
    return gulp.src('app/*.html')
        .pipe(imgRetina({}))
        .on('error', function(e) {
            console.log(e.message);
        })
        .pipe(gulp.dest('dist/img'));

});


gulp.task('imagemin', function() {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin())) // Cache Images
        .pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'retina', 'sass', 'js'], function() {

    var buildFiles = gulp.src([
        'app/*.html',
        'app/.htaccess',
    ]).pipe(gulp.dest('dist'));

    var buildCss = gulp.src([
        'app/css/main.min.css',
    ]).pipe(gulp.dest('dist/css'));

    var buildJs = gulp.src([
        'app/js/scripts.min.js',
    ]).pipe(gulp.dest('dist/js'));

    var buildFonts = gulp.src([
        'app/fonts/**/*',
    ]).pipe(gulp.dest('dist/fonts'));

});

gulp.task('deploy', function() {

    var conn = ftp.create({
        host: 'hostname.com',
        user: 'username',
        password: 'userpassword',
        parallel: 10,
        log: gutil.log
    });

    var globs = [
        'dist/**',
        'dist/.htaccess',
    ];
    return gulp.src(globs, { buffer: false })
        .pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('rsync', function() {
    return gulp.src('dist/**')
        .pipe(rsync({
            root: 'dist/',
            hostname: 'username@yousite.com',
            destination: 'yousite/public_html/',
            // include: ['*.htaccess'], // Скрытые файлы, которые необходимо включить в деплой
            recursive: true,
            archive: true,
            silent: false,
            compress: true
        }));
});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function() { return cache.clearAll(); });

gulp.task('default', ['watch']);