'use strict';

// Module manager
module.exports = function (System) {
	// Load Modules
	var fs = require('fs'),
		appModuleFiles = fs.readdirSync('./modules/'),
		modules = [],
		ignoreModules = ['users']; // Ignore under-development modules

	appModuleFiles.forEach(function(moduleFile){
		if(ignoreModules.indexOf(moduleFile) === -1 ){
			var module = require('../../modules/' + moduleFile)(System);
			modules.push(module);
		}
	});

	// Attach module routes to app
	modules.forEach(function(module){
		System.app.use('/' + module.routeName, module.route);
	});

	return modules;
}