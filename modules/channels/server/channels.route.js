// Channels Route
'use strict';

module.exports = function(System){
	var router = System.express.Router(),
		controller = require('./channels.controller')(System);

	// Routes
	router
		.get('/', controller.get) // Get channels
		.get('/:title/:action', controller.userLeft) // User leaves channel
		.post('/', controller.create); // Create channel

	return router;
};