'use strict';
const { River } = require('vapr');

/*
	This function imitates the transform() function, but is used for HEAD
	requests, and therefore skips unnecessary processing.
 */

module.exports = (body) => {
	if (!River.isRiver(body)) return River.empty();
	return new River((resolve, reject, write, free) => {
		body.then(resolve, reject);
		free(body.pump(validateData));
	});
};

const validateData = (data) => {
	if (!Buffer.isBuffer(data) && typeof data !== 'string' && data != null) {
		throw new TypeError(`Expected response body to be made of buffers or strings (got ${typeof data})`);
	}
};
