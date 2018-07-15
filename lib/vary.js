'use strict';
const { append } = require('vary');

module.exports = ({ headers }) => {
	const current = headers.get('vary');
	headers.set('vary', current ? append(current, ['accept-encoding']) : 'accept-encoding');
};
