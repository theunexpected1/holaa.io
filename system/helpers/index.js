'use strict';

// Production
module.exports = function (System) {
	// Load Helpers
	var fs = require('fs'),
		helperFiles = fs.readdirSync('./system/helpers/'),
		helpers = {};
		
	helperFiles.forEach(function(helperFile){
		if(helperFile.indexOf('.js') > -1 && helperFile.indexOf('index.js') < 0) {
			var helper = require('./' + helperFile)(System);
			helpers[helper.key] = helper.module;
		}
	});
	return helpers;
}