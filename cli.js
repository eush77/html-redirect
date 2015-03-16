#!/usr/bin/env node
'use strict';

var htmlRedirect = require('./');

var camelCase = require('camelcase-keys');

var fs = require('fs');

var argv = require('minimist')(process.argv.slice(2), {
  boolean: 'replace-body'
});


var usage = function (code) {
  var usageText = fs.readFileSync(__dirname + '/usage.txt',
                                  { encoding: 'utf8' });
  process[code ? 'stderr' : 'stdin'].write(usageText);
  process.exit(code);
};

if (argv.help) {
  usage(0);
}
if (argv._.length != 1) {
  usage(1);
}


htmlRedirect(argv._[0], camelCase(argv)).pipe(process.stdout);
