import xmlFormat, {XMLFormatterMinifyOptions, XMLFormatterOptions} from '../src/index';
import {assert} from 'chai';
import {globSync} from 'node:fs';
import path from 'path';
import fs from 'fs';

describe('XML formatter', function () {

    async function assertFormatError(src: string, formatterOptions: XMLFormatterOptions = {}) {
        for (const file of globSync(src)) {
            it('Assert: ' + file, function() {
                const fileContents = fs.readFileSync(file).toString('utf8');
                const relativeFilePath = path.relative(process.cwd(), file);
                try {
                    const formattedContents = xmlFormat(fileContents, formatterOptions);
                    if (formatterOptions.throwOnFailure === false) {
                        assert.equal(formattedContents, fileContents, 'Formatted Content for ' + relativeFilePath);
                    } else {
                        assert.fail('Should fail');
                    }
                } catch (err: unknown) {
                    if (formatterOptions.throwOnFailure === false) {
                        assert.fail('Should not fail');
                    } else {
                        assert.equal((err instanceof Error) ? err.message: err, 'Failed to parse XML');
                    }
                }
            });
        }
    }

    async function assertFormat(src: string, formatterOptions: XMLFormatterOptions = {}) {
        for (const file of globSync(src)) {
            const outputFile = file.replace('-input', '-output');

            it('Assert: ' +  outputFile, function() {
                const fileContents = fs.readFileSync(file).toString('utf8').trimEnd();
                const formattedContents = xmlFormat(fileContents, formatterOptions);
                const formattedContents2 = xmlFormat(formattedContents, formatterOptions);
                let expectedContents = fs.readFileSync(outputFile).toString('utf8').trimEnd();
                const lineSeparator = formatterOptions.lineSeparator ?? '\r\n';
                const relativeFilePath = path.relative(process.cwd(), file);

                if (lineSeparator) {
                    expectedContents = expectedContents.replace(/\r/g, '').replace(/\n/g, lineSeparator);
                }

                assert.equal(formattedContents, expectedContents, 'Formatted Content for ' + relativeFilePath);
                assert.equal(formattedContents2, expectedContents, 'Idempotence test for ' + relativeFilePath);
            });
        }
    }

    async function assertMinifyFormat(src: string, formatterOptions: XMLFormatterMinifyOptions = {}) {
        for (const file of globSync(src)) {
            const outputFile = file.replace('-input', '-output');

            it('Assert: ' +  outputFile, function() {
                const fileContents = fs.readFileSync(file).toString('utf8').trimEnd();
                const formattedContents = xmlFormat.minify(fileContents, formatterOptions);
                const formattedContents2 = xmlFormat.minify(formattedContents, formatterOptions);
                const expectedContents = fs.readFileSync(outputFile).toString('utf8').trimEnd();
                const relativeFilePath = path.relative(process.cwd(), file);

                assert.equal(formattedContents, expectedContents, 'Formatted Content for ' + relativeFilePath);
                assert.equal(formattedContents2, expectedContents, 'Idempotence test for ' + relativeFilePath);
            });
        }
    }

    context('should format XML with comments', function() {
        return assertFormat('test/data1/xml*-input.xml');
    });

    context('should format XML without comments', function() {
        return assertFormat('test/data2/xml*-input.xml', {filter: (node) => node.type !== 'Comment'});
    });

    context('should format XML without indenting text content when option is enabled:', function() {
        return assertFormat('test/data3/xml*-input.xml', {collapseContent: true});
    });

    context('should format XML with various node types', function() {
        return assertFormat('test/data4/xml*-input.xml');
    });

    context('should format XML with the custom line separator', function() {
        return assertFormat('test/data5/xml*-input.xml', {lineSeparator: '\n'});
    });

    context('should format XML that already contains line breaks', function() {
        return assertFormat('test/data6/xml*-input.xml');
    });

    context('should format XML adding a whitespace before self closing tag', function() {
        return assertFormat('test/data7/xml*-input.xml', {whiteSpaceAtEndOfSelfclosingTag: true});
    });

    context('should escape a double quote in an attribute value', function() {
        return assertFormat('test/data8/xml*-input.xml');
    });

    context('should handle XML minification with collapseContent', function() {
        return assertMinifyFormat('test/data9/xml*-input.xml', {collapseContent: true});
    });

    context('should handle XML minification without collapseContent (default)', function() {
        return assertMinifyFormat('test/data11/xml*-input.xml');
    });

    context('should fail when parsing invalid XML', function() {
        return assertFormatError('test/data10/xml*-input.xml');
    });

    context('should fail silently when parsing invalid XML with throwOnFailure=false', function() {
        return assertFormatError('test/data10/xml*-input.xml', {throwOnFailure: false});
    });

    context('should format XML with spaces between tags when collapseContent=true', function() {
        return assertFormat('test/data12/xml*-input.xml', {collapseContent: true});
    });

    context('should format XML with spaces between tags when collapseContent=false', function() {
        return assertFormat('test/data13/xml*-input.xml', {collapseContent: false});
    });

    context('should ignore formatting on specified elements', function() {
        return assertFormat('test/data14/xml*-input.xml', {
            collapseContent: true,
            ignoredPaths: ['/html/head/script', 'pre']
        });
    });

    context('should collapse empty tags when forceSelfClosingEmptyTag=true', function () {
        return assertFormat('test/data15/xml*-input.xml', { forceSelfClosingEmptyTag: true });
    });
    
    context('should not remove space with style before differently stylised word when prettifying xml', function () {
        return assertFormat('test/data16/xml*-input.xml', { collapseContent: true });
    });

    context('use single quote attribute delimiter', function () {
        return assertFormat('test/data17/xml-single*-input.xml', { attributeQuotes: 'single' });
    });

    context('use double quote attribute delimiter', function () {
        return assertFormat('test/data17/xml-double*-input.xml', { attributeQuotes: 'double' });
    });
});
