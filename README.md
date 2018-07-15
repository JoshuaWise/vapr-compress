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

This plugin performs [content negotiation](https://tools.ietf.org/html/rfc7231#section-3.4) to decide how and when to compress a response. It will try to use the Transfer-Encoding header if supported by the client (as indicated by the TE header), but will fallback to the Content-Encoding/Accept-Encoding headers when necessary. Both the [gzip](https://nodejs.org/api/zlib.html#zlib_class_zlib_gzip) and [deflate](https://nodejs.org/api/zlib.html#zlib_class_zlib_deflate) encodings are supported, but gzip will be prioritized when the client has not indicated a preference for one.

Special status codes such as `204` and `304`, as well as `HEAD` requests, are handled appropriately (unnecessary processing is avoided). Also, if the response body is `null` or `undefined`, compression will be skipped; empty strings and buffers *are* still considered eligible, however.

## Options

Any options passed to the plugin are forwarded to the [zlib](https://nodejs.org/api/zlib.html#zlib_class_options) core module. In addition, the behavior of the plugin can be customized with the options below.

### options.aggressive = *false*

By default, if the client does not provide any content negotiation headers, compression will not be applied. If this option is set to `true`, however, compression *will* be applied in such cases.

```js
route.use(compress({ aggressive: true }));
```

### options.forced = *null*

This option is used to bypass content negotiation. It can be set to either `"content-encoding"` or `"transfer-encoding"`, indicating which style of compression to use.

```js
route.use(compress({ forced: 'content-encoding' }));
```

> Since the `aggressive` option modifies the behavior of content negotiation, but the `forced` option turns off content negotiation entirely, the two options are mutually exclusive.

### options.anyStatus = *false*

By default, compression will be skipped if `res.code >= 300`. However, if this option is set to `true`, responses of any status code will be eligible for compression.

```js
route.use(compress({ anyStatus: true }));
```

### options.condition = *null*

A `condition` function can be provided to disable compression on a per-request basis. For each eligible request, `condition` will be invoked with `request` and `response` as arguments. If the function returns `false`, compression will be skipped for that request.

```js
route.use(compress({
  anyStatus: true,
  condition: (req, res) => res.code < 500,
}));
```
