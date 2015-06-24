// Communication helper

'use strict';
module.exports = function(System){
	var helper, communication;

	/**
	 * Communication manager
	 * @type {Object}
	 */
	communication = {
		/**
		 * Response object for fail / error scenarios
		 * @param  {Number} status	fail or success (0 / 1)
		 * @param  {Object} res     Response Object
		 * @param  {Object} json    JSON data for the task at hand
		 * @param  {String} message Descriptive message
		 * @return {null}
		 */
		common: function(status, res, json, message){
			var response = {
				status: status,
				json: json,
				message: message
			};
			res.send(response);
		},

		/**
		 * Response object for success scenarios
		 * @param  {Object} res     Response Object
		 * @param  {Object} json    JSON data for the task at hand
		 * @param  {String} message Descriptive message
		 * @return {null}
		 */
		ok: function(res, json, message){
			communication.common(1, res, json, message);
		},

		/**
		 * Response object for fail / error scenarios
		 * @param  {Object} res     Response Object
		 * @param  {Object} json    JSON data for the task at hand
		 * @param  {String} message Descriptive message
		 * @return {null}
		 */
		fail: function(res, json, message){
			communication.common(0, res, json, message);
		}
	};

	/**
	 * Helper template
	 * @type {Object}
	 */
	helper = {
		module: communication,
		key: 'communication'
	};

	return helper;
};