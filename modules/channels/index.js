// Channel Module
'use strict';

module.exports = function(System){
	var moduleRoute = require('./server/channel.route')(System);

	// Return module object
	return {
		key: 'channels',
		routeName: 'channels',
		route: moduleRoute
	};
};