function newLine(output) {
    output.content += '\n';
    var i;
    for (i = 0; i < output.level; i++) {
        output.content += output.options.indentation;
    }
}

function appendContent(output, content) {
    output.content += content;
}

function processNode(node, output, preserveSpace) {
    if (node.name === '#text' || node.name === '#comment') {
        processContentNode(node, output, preserveSpace);
    } else {
        // Assuming that we only have 3 types of node (#text, #comment and element)
        processElement(node, output, preserveSpace);
    }
}

function processContentNode(node, output, preserveSpace) {
    if (!preserveSpace && output.content.length > 0) {
        newLine(output);
    }
    appendContent(output, node.content);
}

function processElement(node, output, preserveSpace) {
    if (!preserveSpace && output.content.length > 0) {
        newLine(output);
    }

    appendContent(output, '<' + node.name);
    processAttributes(output, node.attributes);

    if (node.children === null) {
        // self-closing node
        appendContent(output, '/>');
    } else {

        appendContent(output, '>');

        output.level++;

        var nodePreserveSpace = node.attributes['xml:space'] === 'preserve';

        node.children.forEach(function(child) {
            processNode(child, output, preserveSpace || nodePreserveSpace);
        });

        output.level--;

        if (!preserveSpace && !nodePreserveSpace) {
            newLine(output);
        }
        appendContent(output, '</' + node.name + '>');
    }
}

function processAttributes(output, attributes) {
    Object.keys(attributes).forEach(function(attr) {
        appendContent(output, ' ' + attr + '="' + attributes[attr] + '"');
    });
}

function processDeclaration(declaration, output) {
    if (declaration) {
        appendContent(output, '<?xml');
        processAttributes(output, declaration.attributes);
        appendContent(output, '?>');
    }
}


/**
 * Converts the given XML into human readable format.
 *
 * @param {String} xml
 * @param {Object} options
 *  @config {Boolean} [debug=false] displays a tree of the parsed XML before formatting
 *  @config {String} [indentation='    '] The value used for indentation
 *  @config {Boolean} [stripComments=false] True to strip the comments
 * @returns {string}
 */
function format(xml, options) {

    options = options || {};
    options.debug = options.debug === true;
    options.indentation = options.indentation || '    ';
    options.stripComments = options.stripComments === true;

    var parse = require('xml-parser-xo');
    var parsedXml = parse(xml, {stripComments: options.stripComments});

    if (options.debug) {
        var inspect = require('util').inspect;
        console.log(inspect(parsedXml, { colors: true, depth: Infinity }));
    }

    var output = {content: '', level: 0, options: options};

    processDeclaration(parsedXml.declaration, output);

    parsedXml.children.forEach(function(child) {
        processNode(child, output, false);
    });

    return output.content;
}


module.exports = format;