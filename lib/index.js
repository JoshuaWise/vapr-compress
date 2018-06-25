'use strict';
const { createGzip, createDeflate } = require('zlib');
const { River } = require('vapr');

module.exports = ({ encoding = 'gzip', transferOnly = false, ...options } = {}) => {
	const commaEncoding = Buffer.from(',' + encoding).toString(); // Serialize string in v8
	const transformer = makeTransformer(encoding, options);
	transferOnly = !!transferOnly;
	return (req) => (res) => {
		const { body, headers } = res;
		if (body == null) return;
		if (!Buffer.isBuffer(body) && !River.isRiver(body) && typeof body !== 'string') {
			throw new TypeError(`Expected response body to be a buffer, string, river, or null (got ${typeof body})`);
		}
		if (transformer) res.body = transformer(body);
		const header = transferOnly && req.version >= '1.1' ? 'transfer-encoding' : 'content-encoding';
		const currentValue = headers.get(header);
		headers.set(header, currentValue ? currentValue + commaEncoding : encoding);
	};
};

const encodeBody = (makeEncoder, options) => (body) => new River((resolve, reject, write, free) => {
	const encoder = makeEncoder(options);
	encoder.on('end', resolve);
	encoder.on('error', reject);
	encoder.on('data', write);
	if (River.isRiver(body)) {
		free(() => { cancel(); encoder.destroy(); });
		body.then(() => void encoder.end(), reject);
		const cancel = body.pump((data) => {
			if (Buffer.isBuffer(data) || typeof data === 'string') encoder.write(data);
			else if (data != null) throw new TypeError(`Expected response body to be made of buffers or strings (got ${typeof data})`);
		});
	} else {
		free(() => { encoder.destroy(); });
		encoder.write(body);
		encoder.end();
	}
});

const makeTransformer = (encoding, options) => {
	const makeEncoder = supportedEncodings.get(encoding);
	if (makeEncoder === undefined) throw new TypeError(`Invalid encoding option: ${encoding}`);
	if (makeEncoder === null) return;
	return encodeBody(makeEncoder, Object.assign({}, options, { info: false }));
};

const supportedEncodings = new Map([
	['gzip', createGzip],
	['deflate', createDeflate],
	['identity', null],
]);
