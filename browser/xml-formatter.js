require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
module.exports = function() {
    return function debug() {
        // empty mock of debug module for browser usage
    };
};
},{}],3:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('xml-parser');

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Parse the given string of `xml`.
 *
 * @param {String} xml
 * @param {Object} [options]
 *  @config {Boolean} [trim=true]
 *  @config {Boolean} [stripComments=true]
 * @return {Object}
 * @api public
 */

function parse(xml, options) {

  // trim content
  if (!options || options.trim) {
    xml = xml.trim();
  }

  // strip comments
  if (!options || options.stripComments) {
    xml = xml.replace(/<!--[\s\S]*?-->/g, '');
  }

  return document();

  /**
   * XML document.
   */

  function document() {

    var decl = declaration();
    var child;
    var children = [];
    var documentRootNode;

    while (child = nextRootChild()) {
      if (child.name !== '#comment') {
        if (documentRootNode) {
          throw new Error('Found multiple root nodes');
        }
        documentRootNode = child;
      }
      children.push(child);
    }

    return {
      declaration: decl,
      root: documentRootNode,
      children: children
    };
  }

  /**
   * Declaration.
   */

  function declaration() {
    var m = match(/^<\?xml\s*/);
    if (!m) return;

    // tag
    var node = {
      attributes: {}
    };

    // attributes
    while (!(eos() || is('?>'))) {
      var attr = attribute();
      if (!attr) return node;
      node.attributes[attr.name] = attr.value;
    }

    match(/\?>\s*/);

    return node;
  }

  /**
   * Tag.
   */

  function tag() {
    debug('tag %j', xml);
    var m = match(/^<([\w-:.]+)\s*/);
    if (!m) return;

    // name
    var node = {
      name: m[1],
      attributes: {},
      children: []
    };

    // attributes
    while (!(eos() || is('>') || is('?>') || is('/>'))) {
      var attr = attribute();
      if (!attr) return node;
      node.attributes[attr.name] = attr.value;
    }

    // self closing tag
    if (match(/^\s*\/>/)) {
      node.children = null;
      return node;
    }

    match(/\??>/);

    // children
    var child;
    while (child = nextChild()) {
      node.children.push(child);
    }

    // closing
    match(/^<\/[\w-:.]+>/);

    return node;
  }

  function nextChild() {
    return tag() || content() || comment();
  }

  function nextRootChild() {
    return tag() || comment();
  }

  function comment() {
    var m = match(/^<!--[\s\S]*?-->/);
    if (m) {
      return {
        name: '#comment',
        content: m[0]
      };
    }
  }

  /**
   * Text content.
   */

  function content() {
    debug('content %j', xml);
    var m = match(/^([^<]+)/);
    if (m) {
      return {
        name: '#text',
        content: m[1]
      };
    }
  }

  /**
   * Attribute.
   */

  function attribute() {
    debug('attribute %j', xml);
    var m = match(/([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|\w+)\s*/);
    if (!m) return;
    return { name: m[1], value: strip(m[2]) }
  }

  /**
   * Strip quotes from `val`.
   */

  function strip(val) {
    return val.replace(/^['"]|['"]$/g, '');
  }

  /**
   * Match `re` and advance the string.
   */

  function match(re) {
    var m = xml.match(re);
    if (!m) return;
    xml = xml.slice(m[0].length);
    return m;
  }

  /**
   * End-of-source.
   */

  function eos() {
    return 0 == xml.length;
  }

  /**
   * Check for `prefix`.
   */

  function is(prefix) {
    return 0 == xml.indexOf(prefix);
  }
}

},{"debug":2}],"xml-formatter":[function(require,module,exports){
function newLine(output) {
    output.content += output.options.lineSeparator;
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

        if (!nodePreserveSpace && output.options.collapseContent) {

            var containsTextNodes = node.children.some(function(child) {
                return child.name === '#text';
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
 *  @config {Boolean} [collapseContent=false] True to keep content in the same line as the element. Only works if element contains at least one text node
 *  @config {String} [lineSeparator='\r\n'] The line separator to use
 * @returns {string}
 */
function format(xml, options) {

    options = options || {};
    options.debug = options.debug === true;
    options.indentation = options.indentation || '    ';
    options.stripComments = options.stripComments === true;
    options.collapseContent = options.collapseContent === true;
    options.lineSeparator = options.lineSeparator || '\r\n';

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

},{"util":1,"xml-parser-xo":3}]},{},[]);
