function newLine(output) {
    output.content += output.options.lineSeparator;
    let i;
    for (i = 0; i < output.level; i++) {
        output.content += output.options.indentation;
    }
}

function appendContent(output, content) {
    output.content += content;
}

function processNode(node, output, preserveSpace) {
    if (typeof node.content === 'string') {
        processContentNode(node, output, preserveSpace);
    } else if (node.type === 'Element') {
        processElement(node, output, preserveSpace);
    } else if (node.type === 'ProcessingInstruction') {
        processProcessingIntruction(node, output, preserveSpace);
    } else {
        throw new Error('Unknown node type: ' + node.type);
    }
}

function processContentNode(node, output, preserveSpace) {
    if (node.content.trim() !== '' || preserveSpace) {
      if (!preserveSpace && output.content.length > 0) {
          newLine(output);
      }
      appendContent(output, node.content);
    }
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
    } else if (node.children.length === 0) {
        // empty node
        appendContent(output, '></' + node.name + '>');
    } else {

        appendContent(output, '>');

        output.level++;

        let nodePreserveSpace = node.attributes['xml:space'] === 'preserve';

        if (!nodePreserveSpace && output.options.collapseContent) {

            const containsTextNodes = node.children.some(function(child) {
                return child.type === 'Text' && child.content.trim() !== '';
            });

            if (containsTextNodes) {
                nodePreserveSpace = true;
            }
        }

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

function processProcessingIntruction(node, output) {
    if (output.content.length > 0) {
        newLine(output);
    }
    appendContent(output, '<?' + node.name);
    processAttributes(output, node.attributes);
    appendContent(output, '?>');
}


/**
 * Converts the given XML into human readable format.
 *
 * @param {String} xml
 * @param {Object} options
 *  @config {String} [indentation='    '] The value used for indentation
 *  @config {function(node)} [filter] Return false to exclude the node.
 *  @config {Boolean} [collapseContent=false] True to keep content in the same line as the element. Only works if element contains at least one text node
 *  @config {String} [lineSeparator='\r\n'] The line separator to use
 * @returns {string}
 */
function format(xml, options = {}) {

    options = options || {};
    options.indentation = options.indentation || '    ';
    options.collapseContent = options.collapseContent === true;
    options.lineSeparator = options.lineSeparator || '\r\n';

    const parse = require('xml-parser-xo');
    const parsedXml = parse(xml, {filter: options.filter});
    const output = {content: '', level: 0, options: options};

    if (parsedXml.declaration) {
        processProcessingIntruction(parsedXml.declaration, output);
    }

    parsedXml.children.forEach(function(child) {
        processNode(child, output, false);
    });

    return output.content;
}


module.exports = format;
