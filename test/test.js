'use strict';

var redirect = require('..');

var tokenize = require('html-tokenize')
  , select = require('html-select')
  , streamToArray = require('stream-to-array')
  , escapeStringRegexp = require('escape-string-regexp');


var sampleUrl = 'http://example.com/';


describe('Core', function () {
  var sampleUrlRegexp = escapeStringRegexp(sampleUrl);

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
                           script.should.match(RegExp('^window.location\\s*=\\s*"'
                                                     + sampleUrlRegexp + '";$'));
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
  it('should set the custom page title', function (done) {
    var customTitle = 'My Fancy Title';

    redirect(sampleUrl, {
      title: customTitle
    }).pipe(tokenize())
      .pipe(select('head > title', function (elem) {
        streamToArray(elem.createReadStream(), function (err, elems) {
          if (err) throw err;

          var title = elems[1][1].toString();
          title.should.equal(customTitle);
          done();
        });
      }));
  });

  it('should use the custom placeholder in <a>', function (done) {
    var customPlaceholder = 'click';

    redirect(sampleUrl, {
      placeholder: customPlaceholder
    }).pipe(tokenize())
      .pipe(select('body a', function (elem) {
        streamToArray(elem.createReadStream(), function (err, elems) {
          if (err) throw err;

          var placeholder = elems[1][1].toString();
          placeholder.should.equal(customPlaceholder);
          done();
        });
      }));
  });
});