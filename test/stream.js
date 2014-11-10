'use strict';

var redirect = require('..');

var tokenize = require('html-tokenize')
  , select = require('html-select')
  , streamToArray = require('stream-to-array');


var sampleUrl = 'http://example.com/';


describe('createStream', function () {
  it('should set the custom page title', function (done) {
    var customTitle = 'My Fancy <Title>'
      , encodedCustomTitle = 'My Fancy &lt;Title&gt;';

    redirect.createStream(sampleUrl, {
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

  it('should read the whole <body> from a stream', function (done) {
    var customBody = '<span class="main">If redirection did not occur, click '
                     + '<a href="http://example.com/">this link</a></span>';

    var stream = redirect.createStream(sampleUrl);

    stream.pipe(tokenize())
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

    stream.end(customBody);
  });
});
