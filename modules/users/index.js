// Users Module
'use strict';

module.exports = function(System){
	var moduleRoute = require('./server/users.route')(System);

	// Return module object
	return {
		key: 'users',
		routeName: 'users',
		route: moduleRoute
	};
};