# vapr-compress [![Build Status](https://travis-ci.org/JoshuaWise/vapr-compress.svg?branch=master)](https://travis-ci.org/JoshuaWise/vapr-compress)

## Installation

```bash
npm install --save vapr
npm install --save vapr-compress
```

## Usage

The `vapr-compress` plugin compresses the response body before it gets sent to the client.

Any options passed to the plugin are forwarded to the [zlib](https://nodejs.org/api/zlib.html#zlib_class_options) core module.

```js
const compress = require('vapr-compress');
const app = require('vapr')();
const route = app.get('/foo');

route.use(compress());
route.use((req) => {
  return [['hello world']]; // This will be gzipped
});
```

## Options

The compression type is determined by the `encoding` option passed to the plugin, which can either be `gzip` (the default), `deflate`, or `identity`.

By default, the encoding is applied to the Content-Encoding header. Alternatively, Transfer-Encoding can be used by passing the `transferOnly` option. However, for HTTP/1.0 requests, Content-Encoding will still be used as a fallback.

```js
route.use(compress({
  encoding: 'deflate',
  transferOnly: true,
}));
```
