// Channels Route
'use strict';

module.exports = function(System){
	var router = System.express.Router(),
		controller = require('./channels.controller')(System);

	// Routes
	router
		.get('/', controller.get) // Get channels
		.post('/', controller.create); // Create channel

	return router;
};