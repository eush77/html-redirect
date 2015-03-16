[![npm](https://nodei.co/npm/html-redirect.png)](https://nodei.co/npm/html-redirect/)

# html-redirect

[![Build Status][travis-badge]][travis] [![Dependency Status][david-badge]][david]

[travis]: https://travis-ci.org/eush77/html-redirect
[travis-badge]: https://travis-ci.org/eush77/html-redirect.svg
[david]: https://david-dm.org/eush77/html-redirect
[david-badge]: https://david-dm.org/eush77/html-redirect.png

Generate HTML redirection page readable stream.

## Example

```js
htmlRedirect('http://example.com')
  .pipe(fs.createWriteStream('example1.html'));
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

## API

### htmlRedirect(url, [options])

Returns a readable stream of HTML.

| Option      | Type    | Required? | Default |
| :---------- | :------ | :-------: | :------ |
| timeout     | number  | No        | `1`     |
| title       | string  | No        |         |
| placeholder | string  | No        |         |
| replaceBody | boolean | No        | `false` |

`options.timeout` is a timeout for meta-tag redirection. JS redirection will fire instantaneously regardless of the value of this option.

`options.title` is the value of `<title>`.

`options.placeholder` is either the text under default `<a>` or the whole `<body>` in HTML depending on `options.replaceBody`.

### htmlRedirect.createStream(url, [options])

Returns a transform stream. Body content -> HTML page.

| Option      | Type    | Required? | Default |
| :---------- | :------ | :-------: | :------ |
| timeout     | number  | No        | `1`     |
| title       | string  | No        |         |

## More examples

### Set some options

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

### Replace body

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

### Use it as a transform stream

example4.js:
```js
process.stdin
  .pipe(htmlRedirect.createStream('http://example.com/'))
  .pipe(process.stdout);
```

Try it in the console:
```
printf 'Contents from the <b>stdin</b>.' |node example.js
```

```
<!DOCTYPE html>
<html>
  <head>
    <title>(redirect)</title>
    <meta http-equiv="refresh" content="1;url=http://example.com/">
    <script>window.location.replace("http://example.com/");</script>
  </head>
  <body>Contents from the <b>stdin</b>.</body>
</html>
```

## Install

```shell
npm install html-redirect
```

## License

MIT
