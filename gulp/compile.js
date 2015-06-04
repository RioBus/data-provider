module.exports = function(gulp, plugins, paths){
    gulp.src([paths.src+"/**/*.ts"])
        .pipe(plugins.typescript({
            target: "es5",
            module: "commonjs",
            removeComments: false
        }))
        .pipe(gulp.dest(paths.build));
};