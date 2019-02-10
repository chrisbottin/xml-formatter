const gulp = require('gulp');

gulp.task('test', function(done) {

    const assertFormatter = function(src, formatterOptions, done) {
        var fs = require('fs'),
            path = require('path'),
            streamAssert = require('stream-assert'),
            formatter = require('./index.js');

        gulp.src(src)
            .pipe(streamAssert.all(function(file) {
                var formattedContents = formatter(file.contents.toString('utf8'), formatterOptions);
                console.log(formattedContents);
            }))
            .pipe(streamAssert.end(done));
    };

    assertFormatter('test/data3/xml*-input.xml', {debug: false, stripComments: true, collapseContent: true}, done);

});
