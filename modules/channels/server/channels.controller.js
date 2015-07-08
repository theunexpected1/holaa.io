// Channels controller
'use strict';

module.exports = function(System){
	var channelController = {},
		mongoose = require('mongoose'),
		Channel = require('./channels.model'),
		communication = System.helpers.communication;

	/**
	 * Create a channel if it does not already exist
	 * @param  {Object} req Request object
	 * @param  {Object} res Response object
	 * @return {Object}     Communication response object
	 */
	channelController.create = function(req, res){
		var params = req.body;

		var channel = new Channel(params);
		channel.save(function(err, data){
			if(err){
				communication.fail(res, err);
			}
			return communication.ok(res, channel);
		})
	};

	/**
	 * Get channels
	 * @param  {Object} req Request object
	 * @param  {Object} res Response object
	 * @return {Object}     Communication response object
	 */
	channelController.get = function(req, res){
		// ToDo: Query here for retrieving channels based on params

		Channel.find().exec(function(err, channels){
			if(err){
				return communication.fail(res, err);
			}
			return communication.ok(res, channels);
		});
	};

	return channelController;
}