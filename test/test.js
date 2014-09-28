'use strict';

var redirect = require('..');

var tokenize = require('html-tokenize')
  , select = require('html-select')
  , streamToArray = require('stream-to-array')
  , escapeStringRegexp = require('escape-string-regexp');


var sampleUrl = 'http://example.com/'
  , sampleUrlRegexp = escapeStringRegexp(sampleUrl);


describe('Core', function () {
  it('should construct a proper meta tag', function (done) {
    redirect(sampleUrl).pipe(tokenize())
                       .pipe(select('head > meta', function (elem) {
                         elem.getAttribute('http-equiv').should.equal('refresh');
                         elem.getAttribute('content')
                             .should.match(RegExp('^\\d+;url=' + sampleUrlRegexp + '$'));
                         done();
                       }));
  });

  it('should try to redirect through changing window.location', function (done) {
    redirect(sampleUrl).pipe(tokenize())
                       .pipe(select('head > script', function (elem) {
                         streamToArray(elem.createReadStream(), function (err, elems) {
                           if (err) throw err;

                           var script = elems[1][1].toString();
                           var expected = 'window.location.replace("' + sampleUrl + '");';
                           script.should.match(RegExp('^' + escapeStringRegexp(expected) + '$'));
                           done();
                         });
                       }));
  });

  it('should put a link in the <body> by default', function (done) {
    redirect(sampleUrl).pipe(tokenize())
                       .pipe(select('body a', function (elem) {
                         elem.getAttribute('href').should.equal(sampleUrl);
                         done();
                       }));
  });
});


describe('Options', function () {
  it('should set the specified refresh timeout', function (done) {
    var customTimeout = 77;

    redirect(sampleUrl, {
      timeout: customTimeout
    }).pipe(tokenize())
      .pipe(select('head > meta', function (elem) {
        elem.getAttribute('content')
            .should.match(RegExp('^' + customTimeout + ';url=' + sampleUrlRegexp + '$'));
        done();
      }));
  });

  it('should set the custom page title', function (done) {
    var customTitle = 'My Fancy <Title>'
      , encodedCustomTitle = 'My Fancy &lt;Title&gt;';

    redirect(sampleUrl, {
      title: customTitle
    }).pipe(tokenize())
      .pipe(select('head > title', function (elem) {
        streamToArray(elem.createReadStream(), function (err, elems) {
          if (err) throw err;

          var title = elems[1][1].toString();
          title.should.equal(encodedCustomTitle);
          done();
        });
      }));
  });

  it('should use the custom placeholder in <a>', function (done) {
    var customPlaceholder = 'c<li>ck'
      , encodedCustomPlaceholder = 'c&lt;li&gt;ck';

    redirect(sampleUrl, {
      placeholder: customPlaceholder
    }).pipe(tokenize())
      .pipe(select('body a', function (elem) {
        streamToArray(elem.createReadStream(), function (err, elems) {
          if (err) throw err;

          var placeholder = elems[1][1].toString();
          placeholder.should.equal(encodedCustomPlaceholder);
          done();
        });
      }));
  });

  it('should replace the whole <body> with the placeholder', function (done) {
    var customBody = '<span class="main">If redirection did not occur, click '
                     + '<a href="http://example.com/">this link</a></span>';

    redirect(sampleUrl, {
      placeholder: customBody,
      replaceBody: true
    }).pipe(tokenize())
      .pipe(select('body', function (elem) {
        streamToArray(elem.createReadStream(), function (err, elems) {
          if (err) throw err;

          var body = elems.slice(1, -1).map(function (row) {
            return row[1];
          }).join('');

          body.should.equal(customBody);
          done();
        });
      }));
  });
});