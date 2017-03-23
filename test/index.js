describe('XML formatter', function () {

    it('should format input XML files correctly with comments', function(done) {

        var gulp = require('gulp'),
            fs = require('fs'),
            path = require('path'),
            streamAssert = require('stream-assert'),
            assert = require('chai').assert,
            formatter = require('../index.js');

        gulp.src('test/data1/xml*-input.xml')
            .pipe(streamAssert.all(function(file) {
                var formattedContents = formatter(file.contents.toString('utf8'), {debug: false});
                var expectedContents = fs.readFileSync(file.path.replace('-input', '-output')).toString('utf8');

                expectedContents = expectedContents.replace(/\r/g, '').replace(/\n/g, '\r\n');

                assert.equal(expectedContents, formattedContents, 'Formatted Content for ' + path.basename(file.path));
            }))
            .pipe(streamAssert.end(done));
    });


    it('should format input XML files correctly without comments', function(done) {

        var gulp = require('gulp'),
            fs = require('fs'),
            path = require('path'),
            streamAssert = require('stream-assert'),
            assert = require('chai').assert,
            formatter = require('../index.js');

        gulp.src('test/data2/xml*-input.xml')
            .pipe(streamAssert.all(function(file) {
                var formattedContents = formatter(file.contents.toString('utf8'), {debug: false, stripComments: true});
                var expectedContents = fs.readFileSync(file.path.replace('-input', '-output')).toString('utf8');

                expectedContents = expectedContents.replace(/\r/g, '').replace(/\n/g, '\r\n');

                assert.equal(expectedContents, formattedContents, 'Formatted Content for ' + path.basename(file.path));
            }))
            .pipe(streamAssert.end(done));
    });

});
