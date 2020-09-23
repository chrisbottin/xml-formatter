const assert = require('chai').assert;
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const format = require('../index');

describe('XML formatter', function () {

    const assertFormat = function(src, formatterOptions, done) {
        glob(src, function(er, files) {

            files.forEach(file => {
                const fileContents = fs.readFileSync(file).toString('utf8');
                const formattedContents = format(fileContents, formatterOptions);
                const formattedContents2 = format(formattedContents, formatterOptions);
                let expectedContents = fs.readFileSync(file.replace('-input', '-output')).toString('utf8');
                const lineSeparator = formatterOptions.lineSeparator || '\r\n';
                const relativeFilePath = path.relative(process.cwd(), file);

                expectedContents = expectedContents.replace(/\r/g, '').replace(/\n/g, lineSeparator);

                assert.equal(formattedContents, expectedContents, 'Formatted Content for ' + relativeFilePath);
                assert.equal(formattedContents2, expectedContents, 'Idempotence test for ' + relativeFilePath);
            });

            done();
        });
    }

    it('should format XML with comments', function(done) {
        assertFormat('test/data1/xml*-input.xml', {}, done);
    });

    it('should format XML without comments', function(done) {
        assertFormat('test/data2/xml*-input.xml', {filter: (node) => node.type !== 'Comment'}, done);
    });

    it('should format XML without indenting text content when option is enabled', function(done) {
        assertFormat('test/data3/xml*-input.xml', {collapseContent: true}, done);
    });

    it('should format XML with various node types', function(done) {
        assertFormat('test/data4/xml*-input.xml', {}, done);
    });

    it('should use single quotes for attribute that contains unescaped double quote', function(done) {
        assertFormat('test/data8/xml*-input.xml', {}, done);
    });

    it('should format XML with the custom line separator', function(done) {
        assertFormat('test/data5/xml*-input.xml', {lineSeparator: '\n'}, done);
    });

    it('should format XML that already contains line breaks', function(done) {
        assertFormat('test/data6/xml*-input.xml', {}, done);
    });
  
    it('should format XML adding a whitespace before self closing tag', function(done) {
        assertFormat('test/data7_white-space-on-closing-tag/xml*-input.xml', {whiteSpaceAtEndOfSelfclosingTag: true}, done);
    });

});
