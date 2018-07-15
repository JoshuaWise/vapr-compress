'use strict';
const { createGzip, createDeflate } = require('zlib');
const { River } = require('vapr');
const transform = require('./transform');
const vary = require('./vary');

module.exports = (shouldVary, onlySuccesses, condition, options) => (req, header, encoding) => (res) => {
	if (res.code === 204 || res.code === 304) {
		if (shouldVary) vary(res);
		return;
	}
	
	if (onlySuccesses && res.code >= 300) return;
	if (shouldVary) vary(res);
	if (!header) return;
	if (condition && !condition(req, res)) return;
	if (res.body == null) return;
	
	if (!Buffer.isBuffer(res.body) && !River.isRiver(res.body) && typeof res.body !== 'string') {
		throw new TypeError(`Expected response body to be a buffer, string, river, or null (got ${typeof res.body})`);
	}
	
	if (req.method === 'HEAD') {
		res.body = River.empty();
	} else {
		res.body = transform(res.body, (encoding === 'gzip' ? createGzip : createDeflate)(options));
	}
	
	const current = res.headers.get(header);
	res.headers.set(header, current ? `${current}, ${encoding}` : encoding);
};
