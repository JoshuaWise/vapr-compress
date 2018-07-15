'use strict';

/*
	This handler is used when content negotiation is turned off. It will always
	use the gzip encoding, and can use either the Content-Encoding or
	Transfer-Encoding header, depending on how it's configured.
 */

module.exports = (lateHandler, header) => (req) => lateHandler(req, header, 'gzip');
