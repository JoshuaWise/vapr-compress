'use strict';
const negotiated = require('negotiated');

/*
	This handler is used when content negotiation is turned on. It supports both
	the gzip and deflate encodings, but will choose gzip when no preference is
	given by the client. It prefers to use the Transfer-Encoding header if
	possible, but will use the Content-Encoding header as a fallback.
 */

module.exports = (lateHandler, encodeByDefault) => (req) => {
	let transferEncoding = '';
	let contentEncoding = '';
	
	// Identify the preferred Transfer-Encoding, if provided by the client.
	const teHeader = req.headers.get('te');
	if (teHeader) {
		try { transferEncoding = getTopEncoding(negotiated.transferEncodings(teHeader), transferEncodings); }
		catch (_) { return [400, 'Malformed TE Header']; }
		if (!transferEncoding) return [501, 'No Acceptable Transfer-Encoding'];
		if (transferEncoding === 'identity') transferEncoding = '';
	}
	
	// Identify the preferred Content-Encoding, if provided by the client.
	const acHeader = req.headers.get('accept-encoding');
	if (acHeader !== undefined) {
		try { contentEncoding = getTopEncoding(negotiated.encodings(acHeader), contentEncodings); }
		catch (_) { return [400, 'Malformed Accept-Encoding Header']; }
		if (!contentEncoding) return [406, 'No Acceptable Content-Encoding'];
		if (contentEncoding === 'identity') contentEncoding = '';
	} else {
		// If no Accept-Encoding header was provided, any encoding is valid.
		if (encodeByDefault) contentEncoding = 'gzip';
	}
	
	if (transferEncoding) return lateHandler(req, 'transfer-encoding', transferEncoding);
	if (contentEncoding) return lateHandler(req, 'content-encoding', contentEncoding);
	return lateHandler(req, '', '');
};

const getTopEncoding = (encodings, understood) => {
	const present = new Map;
	for (const x of encodings) if (understood.includes(x.encoding)) present.set(x.encoding, x);
	if (!present.size) return 'identity';
	const [best, second] = [...present.values()].sort(sortByWeight);
	if (!best.weight) return present.has('identity') || present.has('*') ? '' : 'identity';
	if (best.encoding !== '*') return best.encoding;
	const missing = understood.find(findMissing, present);
	return missing || (second.weight ? second.encoding : '');
};

function findMissing(x) { return !this.has(x); }
const sortByWeight = (a, b) => b.weight - a.weight;
const transferEncodings = ['gzip', 'deflate', 'identity'];
const contentEncodings = ['gzip', 'deflate', 'identity', '*'];
