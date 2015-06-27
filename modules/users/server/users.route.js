// Users Route
'use strict';

module.exports = function(System){
	var router = System.express.Router(),
		controller = require('./users.controller')(System);

	// Routes
	router
		.get('/', controller.get) // Get users
		.post('/', controller.create); // Create users

	return router;
};