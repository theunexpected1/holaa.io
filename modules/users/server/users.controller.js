// Users controller
'use strict';

module.exports = function(System){
	var usersController = {},
		mongoose = require('mongoose'),
		User = require('./users.model'),
		communication = System.helpers.communication;

	/**
	 * Create a user with the params provided
	 * @param  {Object} req Request object
	 * @param  {Object} res Response object
	 * @return {Object}     Communication response object
	 */
	usersController.create = function(req, res){
		var params = {
			fullName: req.body.fullName,
			email: req.body.email
		};

		var user = new User(params);
		user.save(function(err, data){
			if(err){
				communication.fail(res, err);
			}
			return communication.ok(res, user);
		})
	};

	/**
	 * Get users
	 * @param  {Object} req Request object
	 * @param  {Object} res Response object
	 * @return {Object}     Communication response object
	 */
	usersController.get = function(req, res){
		// ToDo: Query here for retrieving users based on params

		User.find().exec(function(err, users){
			if(err){
				return communication.fail(res, err);
			}
			return communication.ok(res, users);
		});
	};

	return usersController;
}