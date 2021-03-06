# vapr-compress [![Build Status](https://travis-ci.org/JoshuaWise/vapr-compress.svg?branch=master)](https://travis-ci.org/JoshuaWise/vapr-compress)

## Installation

```bash
npm install --save vapr
npm install --save vapr-compress
```

## Usage

This plugin applies standard compression to Vapr responses.

```js
const compress = require('vapr-compress');
const app = require('vapr')();
const route = app.get('/foo');

route.use(compress());
route.use((req) => {
  return [['hello world']]; // This will be gzipped
});
```

## Details

This plugin utilizes [content negotiation](https://tools.ietf.org/html/rfc7231#section-3.4) to decide when to compress a response. It will try to use the Transfer-Encoding header if supported by the client (as indicated by the TE header), but will fallback to the Content-Encoding/Accept-Encoding headers when necessary. Both the [gzip](https://nodejs.org/api/zlib.html#zlib_class_zlib_gzip) and [deflate](https://nodejs.org/api/zlib.html#zlib_class_zlib_deflate) encodings are supported, but gzip will be prioritized when the client has not indicated a preference.

If the response body is `null` or `undefined`, compression will be skipped. However, empty strings and buffers *are* still considered eligible (for the sake of cache coherence, response size is not taken into consideration by default). Compression is also skipped for `HEAD` requests, but headers are still set as if it were a `GET` request.

Unless the [`forced`](#optionsforced--null) option is used or the [`only`](#optionsonly--null) option is set to `"transfer-encoding"`, the Vary header will be automatically updated to make caches aware of the content negotiation.

## Options

Any options passed to the plugin are forwarded to the [zlib](https://nodejs.org/api/zlib.html#zlib_class_options) core module. In addition, the behavior of the plugin can be customized with the options below.

### options.only = *null*

This option is used to restrict compression to either `"content-encoding"` or `"transfer-encoding"`, disabling the opposite style.

```js
route.use(compress({ only: 'transfer-encoding' }));
```

### options.aggressive = *false*

By default, if the client doesn't provide any content negotiation headers, compression will be skipped. However, if `aggressive` is `true`, compression (Content-Encoding) will be used in such cases.

```js
route.use(compress({ aggressive: true }));
```

> Since the `aggressive` option modifies the behavior of Content-Encoding compression, it cannot be used when the `only` option is set to `"transfer-encoding"`.

### options.forced = *null*

This option is used to bypass content negotiation. It can be set to either `"content-encoding"` or `"transfer-encoding"`, indicating which style of compression to use.

```js
route.use(compress({ forced: 'content-encoding' }));
```

> Since the `aggressive` and `only` options modify the behavior of content negotiation but the `forced` option turns off content negotiation entirely, the neither of the former options can be used in combination with `forced`.

### options.anyStatus = *false*

The default behavior is to skip responses that have a status code of `300` or higher. If this option is set to `true`, however, responses of any status code will be eligible for compression.

```js
route.use(compress({ anyStatus: true }));
```

### options.condition = *null*

Optionally, a `condition` function can be provided to bypass compression on a per-request basis. For each eligible request, the function will be invoked with `request` and `response` as arguments. If the function does not return `true`, compression will be skipped for that request.

```js
route.use(compress({
  anyStatus: true,
  condition: (req, res) => res.code < 500,
}));
```
