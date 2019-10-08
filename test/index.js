describe('XML formatter', function () {

    const assertFormatter = function(src, formatterOptions, done) {
        var gulp = require('gulp'),
            fs = require('fs'),
            path = require('path'),
            streamAssert = require('stream-assert'),
            assert = require('chai').assert,
            formatter = require('../index.js');

        gulp.src(src)
            .pipe(streamAssert.all(function(file) {
                var formattedContents = formatter(file.contents.toString('utf8'), formatterOptions);
                var expectedContents = fs.readFileSync(file.path.replace('-input', '-output')).toString('utf8');
                var lineSeparator = formatterOptions.lineSeparator || '\r\n';

                expectedContents = expectedContents.replace(/\r/g, '').replace(/\n/g, lineSeparator);

                assert.equal(expectedContents, formattedContents, 'Formatted Content for ' + path.relative(process.cwd(), file.path));
            }))
            .pipe(streamAssert.end(done));
    };

    it('should format input XML files correctly with comments', function(done) {
        assertFormatter('test/data1/xml*-input.xml', {debug: false}, done);
    });


    it('should format input XML files correctly without comments', function(done) {
        assertFormatter('test/data2/xml*-input.xml', {debug: false, stripComments: true}, done);
    });


    it('should format input XML files correctly without indenting text content when option is enabled', function(done) {
        assertFormatter('test/data3/xml*-input.xml', {debug: false, stripComments: false, collapseContent: true}, done);
    });

    it.skip('should format input XML files with DOCTYPE correctly - TODO https://github.com/chrisbottin/xml-formatter/issues/8', function(done) {
        assertFormatter('test/data4/xml*-input.xml', {debug: false, stripComments: false, collapseContent: true}, done);
    });

    it('should format input XML files with the custom line separator', function(done) {
        assertFormatter('test/data5/xml*-input.xml', {lineSeparator: '\n'}, done);
    });



});
