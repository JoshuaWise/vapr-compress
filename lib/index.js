'use strict';
const compress = require('./compress');
const negotiate = require('./negotiate');
const dontNegotiate = require('./dont-negotiate');

module.exports = ({ only, aggressive, forced, anyStatus, condition, ...options } = {}) => {
	if (condition != null && typeof condition !== 'function') {
		throw new TypeError(`Expected 'condition' option to be a function (got ${typeof condition})`);
	}

	let shouldVary = true;
	let disableTransfer = false;
	let disableContent = false;

	if (only != null) {
		if (typeof only !== 'string') {
			throw new TypeError(`Expected 'only' option to be a string (got ${typeof only})`);
		}
		if (!['content-encoding', 'transfer-encoding'].includes(only.toLowerCase())) {
			throw new TypeError('Expected \'only\' option to be content-encoding or transfer-encoding');
		}
		if (only.toLowerCase() === 'transfer-encoding') {
			if (aggressive) {
				throw new TypeError('The \'aggressive\' option cannot be used when \'only\' is set to transfer-encoding');
			}
			shouldVary = false;
			disableContent = true;
		} else {
			disableTransfer = true;
		}
	}

	if (forced != null) {
		if (typeof forced !== 'string') {
			throw new TypeError(`Expected 'forced' option to be a string (got ${typeof forced})`);
		}
		if (!['content-encoding', 'transfer-encoding'].includes(forced.toLowerCase())) {
			throw new TypeError('Expected \'forced\' option to be content-encoding or transfer-encoding');
		}
		if (aggressive) {
			throw new TypeError('The \'aggressive\' and \'forced\' options are mutually exclusive');
		}
		if (only) {
			throw new TypeError('The \'only\' and \'forced\' options are mutually exclusive');
		}
		shouldVary = false;
	}

	const lateHandler = compress(shouldVary, !anyStatus, condition, Object.assign({}, options, { info: false }));

	if (forced) return dontNegotiate(lateHandler, forced.toLowerCase());
	return negotiate(lateHandler, disableTransfer, disableContent, !!aggressive);
};
