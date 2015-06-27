// Messages controller
'use strict';

module.exports = function(System){
	var messagesController = {},
		mongoose = require('mongoose'),
		Message = require('./messages.model'),
		communication = System.helpers.communication;

	/**
	 * Create a message if it does not already exist
	 * @param  {Object} req Request object
	 * @param  {Object} res Response object
	 * @return {Object}     Communication response object
	 */
	messagesController.create = function(req, res){
		var params = {
			message: req.body.message,
			created_by: req.body.created_by,
			channel: req.body.channel
		}
		var message = new Message(params);
		message.save(function(err, data){
			if(err){
				communication.fail(res, err);
			}
			return communication.ok(res, message);
		});
	};

	return messagesController;
}