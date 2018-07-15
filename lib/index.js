'use strict';
const compress = require('./compress');
const negotiate = require('./negotiate');
const dontNegotiate = require('./dont-negotiate');

module.exports = ({ aggressive, forced, anyStatus, condition, ...options } = {}) => {
	if (condition != null && typeof condition !== 'function') {
		throw new TypeError(`Expected 'condition' option to be a function (got ${typeof condition})`);
	}
	
	if (forced != null) {
		if (typeof forced !== 'string') {
			throw new TypeError(`Expected 'forced' option to be a string (got ${typeof forced})`);
		}
		if (!['content-encoding', 'transfer-encoding'].includes(forced.toLowerCase())) {
			throw new TypeError('Expected \'forced\' option to be content-encoding or transfer-encoding');
		}
	}
	
	if (aggressive && forced) {
		throw new TypeError(`The 'aggressive' and 'forced' options are mutually exclusive`);
	}
	
	const lateHandler = compress(!forced, !anyStatus, condition, Object.assign({}, options, { info: false }));
	
	if (forced) return dontNegotiate(lateHandler, forced.toLowerCase());
	return negotiate(lateHandler, !!aggressive);
};
