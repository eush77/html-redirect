'use strict';

var trumpet = require('trumpet')
  , escapeHtml = require('escape-html');

var fs = require('fs')
  , url = require('url');


/**
 * Add redirection <meta> and <script> to the basic HTML page.
 *
 * @arg {string} href
 * @arg {number} [timeout=1] - Http-equiv refresh timeout (in seconds).
 * @arg {function(tr)} [transform] - Function transforming the Trumpet instance
 *                                   before it is applied to the template page.
 * @return {stream.Readable}
 */
var createRedirectionStream = function (href, timeout, transform) {
  if (timeout == null) {
    timeout = 1;
  }

  // Normalize and escape URL.
  href = url.parse(href).format();

  var tr = trumpet();

  tr.select('meta[http-equiv="refresh"]')
    .setAttribute('content', timeout + ';url=' + href);

  tr.select('head > script')
    .createWriteStream()
    .end('window.location.replace("' + href + '");');

  transform(tr);

  return fs.createReadStream(__dirname + '/template.html')
           .pipe(tr);
};


/**
 * Trumpet transform that sets the page <title>.
 *
 * @arg {Trumpet} tr
 * @arg {string} [title]
 */
var setTitle = function (tr, title) {
  if (title != null) {
    tr.select('title')
      .createWriteStream()
      .end(escapeHtml(title));
  }
};


/**
 * Generate HTML redirection page, with configurable <title> and <body>.
 *
 * @arg {string} href
 * @arg {Object} [options]
 * @property {number} [timeout=1] - Http-equiv refresh timeout (in seconds).
 * @property {string} [title] - Value of the <title>.
 * @property {string} [placeholder] - Text under <a> in the page body.
 * @property {boolean} [replaceBody=false] - Whether placeholder contains the whole <body> in HTML.
 * @return {stream.Readable}
 */
module.exports = function (href, options) {
  options = options || {};

  return createRedirectionStream(href, options.timeout, function (tr) {
    setTitle(tr, options.title);

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
  });
};
