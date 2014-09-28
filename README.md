# html-redirect [![Build Status][travis-badge]][travis] [![Dependency Status][david-badge]][david] [![DevDependency Status][david-dev-badge]][david-dev]

[travis-badge]: https://travis-ci.org/eush77/html-redirect.svg
[travis]: https://travis-ci.org/eush77/html-redirect
[david-badge]: https://david-dm.org/eush77/html-redirect.png
[david]: https://david-dm.org/eush77/html-redirect
[david-dev-badge]: https://david-dm.org/eush77/html-redirect/dev-status.png
[david-dev]: https://david-dm.org/eush77/html-redirect#info=devDependencies

Generate HTML redirection page.

## Example

As simple as it can be:
```js
htmlRedirect('http://example.com').pipe(fs.createWriteStream('example1.html'));
```

example1.html:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>(redirect)</title>
    <meta http-equiv="refresh" content="1;url=http://example.com/">
    <script>window.location.replace("http://example.com/");</script>
  </head>
  <body><a href="http://example.com/">Click me</a></body>
</html>
```

You can set some options if you want.
```js
htmlRedirect('http://example.com', {
  timeout: 0,
  title: 'please wait...',
  placeholder: 'Your browser does not support redirection. Please click this link.'
}).pipe(fs.createWriteStream('example2.html'));
```

example2.html:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>please wait...</title>
    <meta http-equiv="refresh" content="0;url=http://example.com/">
    <script>window.location.replace("http://example.com/");</script>
  </head>
  <body><a href="http://example.com/">Your browser does not support redirection. Please click this link.</a></body>
</html>
```

```js
htmlRedirect('http://example.com', {
  timeout: 3,
  title: 'please wait...',
  placeholder: 'Your browser does not support redirection. Please click <a href="http://example.com">this link</a>.',
  replaceBody: true
}).pipe(fs.createWriteStream('example3.html'));
```

example3.html:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>please wait...</title>
    <meta http-equiv="refresh" content="3;url=http://example.com/">
    <script>window.location.replace("http://example.com/");</script>
  </head>
  <body>Your browser does not support redirection. Please click <a href="http://example.com">this link</a>.</body>
</html>
```

## API

### htmlRedirect(url, [options])

The return value is a [readable stream](http://nodejs.org/api/stream.html#stream_class_stream_readable), which can be fed to [fs.createWriteStream](http://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options), [process.stdout](http://nodejs.org/api/process.html#process_process_stdout), [concat-stream](https://www.npmjs.org/package/concat-stream), [html-tokenize](https://npmjs.org/package/html-tokenize), or virtually any other writable or transform stream.

### Options

| Option      | Type    | Required? | Default |
| :---------- | :------ | :-------: | :------ |
| timeout     | number  | No        | `1`     |
| title       | string  | No        |         |
| placeholder | string  | No        |         |
| replaceBody | boolean | No        | `false` |

`options.timeout` is probably not what you think it is! It is used *only* in meta-tag redirection. Most of the time JS redirection fires instantaneously regardless of the value of this option.

`options.title` is the value of `<title>`.

`options.placeholder` is either the text under default `<a>` or the whole `<body>` in HTML depending on `options.replaceBody`.

## License

MIT