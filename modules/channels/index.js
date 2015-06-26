// Channels Module
'use strict';

module.exports = function(System){
	var moduleRoute = require('./server/channels.route')(System);

	// Return module object
	return {
		key: 'channels',
		routeName: 'channels',
		route: moduleRoute
	};
};