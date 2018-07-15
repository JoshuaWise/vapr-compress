'use strict';
const { River } = require('vapr');

/*
	This function transforms a string/buffer/river (response body) through a
	duplex stream.
 */

module.exports = (body, stream) => new River((resolve, reject, write, free) => {
	stream.on('end', resolve);
	stream.on('error', reject);
	stream.on('data', write);
	if (River.isRiver(body)) {
		free(() => { cancel(); stream.destroy(); });
		body.then(() => void stream.end(), reject);
		const cancel = body.pump((data) => {
			if (Buffer.isBuffer(data) || typeof data === 'string') stream.write(data);
			else if (data != null) throw new TypeError(`Expected response body to be made of buffers or strings (got ${typeof data})`);
		});
	} else {
		free(() => { stream.destroy(); });
		stream.write(body);
		stream.end();
	}
});
