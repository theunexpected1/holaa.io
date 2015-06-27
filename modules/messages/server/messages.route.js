// Messages Route
'use strict';

module.exports = function(System){
	var router = System.express.Router(),
		controller = require('./messages.controller')(System);

	// Routes
	router
		.post('/', controller.create); // Create message

	return router;
};