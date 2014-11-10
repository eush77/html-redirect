'use strict';

var trumpet = require('trumpet')
  , escapeHtml = require('escape-html')
  , duplexer = require('duplexer2')
  , dent = require('dent');

var fs = require('fs')
  , url = require('url');


/**
 * Add redirection <meta> and <script> to the basic HTML page.
 *
 * @arg {string} href
 * @arg {number} [timeout=1] - Http-equiv refresh timeout (in seconds).
 * @arg {function(tr)} [transform] - Function transforming the Trumpet instance
 *                                   before it is applied to the template page.
 * @return {Readable | {stream: Readable, trumpet: Trumpet}}
 *   If `transform` argument not set, return both stream and trumpet.
 *   Otherwise, just the stream.
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

  if (transform) {
    transform(tr);
  }

  var stream = fs.createReadStream(__dirname + '/template.html')
                 .pipe(tr);

  return transform ? stream : {
    stream: stream,
    trumpet: tr
  };
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
 * @return {Readable}
 */
var htmlRedirect = function (href, options) {
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


/**
 * Generate HTML redirection page and return a transform stream.
 * Writing to it fills up the <body>, reading results in the final compiled page.
 *
 * @arg {string} href
 * @arg {Object} [options]
 * @property {number} [timeout=1] - Http-equiv refresh timeout (in seconds).
 * @property {string} [title] - Value of the <title>.
 * @return {Transform}
 */
htmlRedirect.createStream = function (href, options) {
  options = options || {};

  dent(createRedirectionStream(href, options.timeout));

  setTitle(dent.o.trumpet, options.title);

  var writable = dent.o.trumpet.select('body').createWriteStream();
  var readable = dent.o.stream;
  return duplexer(writable, readable);
};


module.exports = htmlRedirect;
