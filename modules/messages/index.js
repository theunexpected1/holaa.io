// Messages Module
'use strict';

module.exports = function(System){
	var moduleRoute = require('./server/messages.route')(System);

	// Return module object
	return {
		key: 'messages',
		routeName: 'messages',
		route: moduleRoute
	};
};