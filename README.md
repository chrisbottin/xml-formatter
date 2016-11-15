
# xml-formatter

  Converts XML into a human readable format (pretty print) while respecting the xml:space attribute.
  
  This module can also be used on the browser using the browserified version with a small footprint (8KB file size).
  
  [![Travis CI status](https://api.travis-ci.org/chrisbottin/xml-formatter.svg?branch=master)](https://travis-ci.org/chrisbottin/xml-formatter)

  [![NPM](https://nodei.co/npm/xml-formatter.png?downloads=true)](https://nodei.co/npm/xml-formatter/)

## Installation

```
$ npm install xml-formatter
```

## Example

 JavaScript:

```js
var format = require('xml-formatter');
var xml = '<root><!-- content --><content><p xml:space="preserve">This is <b>some</b> content.</content></p>';

var formattedXml = format(xml);
console.log(formattedXml);
```

Output:

```xml
<root>
    <!-- test -->
    <content>
        <p xml:space="preserve">This is <b>some</b> content.</p>
    </content>
</root>
```

## Options

 JavaScript:
 
```js
var format = require('xml-formatter');
var xml = '<root><!-- content --><content><p xml:space="preserve">This is <b>some</b> content.</content></p>';

var options = {indentation: '  ', stripComments: true};
var formattedXml = format(xml, options);

console.log(formattedXml);
```

Output:

```xml
<root>
  <content>
    <p xml:space="preserve">This is <b>some</b> content.</p>
  </content>
</root>
```

- `stripComments` (Boolean, default=`true`) True to strip the comments.
- `indentation` (String, default=`'    '`) The value used for indentation.
- `debug` (Boolean, default=`false`) Displays a tree of the parsed XML before formatting.


## On The Browser

 Page:
 
```html
<script type="text/javascript" src="browser/xml-formatter.js"></script>
```

 Usage:
 
```js
var format = require('xml-formatter');
var xml = '<root><content><p xml:space="preserve">This is <b>some</b> content.</content></p>';

var formattedXml = format(xml);
console.log(formattedXml);
```

Output:

```xml
<root>
    <content>
        <p xml:space="preserve">This is <b>some</b> content.</p>
    </content>
</root>
```

# License

  MIT