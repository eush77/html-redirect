'use strict';

var trumpet = require('trumpet')
  , escapeHtml = require('escape-html');

var fs = require('fs')
  , url = require('url');


/**
 * Generate HTML redirection page.
 *
 * @arg {string} href
 * @arg {Object} options
 * @property {string} [title] - Value of the <title>.
 * @property {string} [placeholder] - Text under <a> in the page body.
 * @property {boolean} [replaceBody=false] - Whether placeholder contains the whole <body> in HTML.
 * @return {stream.Readable}
 */
module.exports = function (href, options) {
  options = options || {};

  // Normalize and escape URL.
  href = url.parse(href).format();

  var tr = trumpet();

  if (options.title != null) {
    tr.select('title')
      .createWriteStream()
      .end(escapeHtml(options.title));
  }

  tr.select('meta[http-equiv="refresh"]')
    .setAttribute('content', '1;url=' + href);

  tr.select('head > script')
    .createWriteStream()
    .end('window.location = "' + href + '";');

  if (options.replaceBody) {
    tr.select('body')
      .createWriteStream()
      .end(options.placeholder);
  }
  else {
    var link = tr.select('body a');
    link.setAttribute('href', href);

    if (options.placeholder != null) {
      link.createWriteStream()
          .end(escapeHtml(options.placeholder));
    }
  }

  return fs.createReadStream(__dirname + '/template.html')
           .pipe(tr);
};
