'use strict';

// Module manager
module.exports = function (System) {
	// Load Modules
	var fs = require('fs'),
		appModuleFiles = fs.readdirSync('./modules/'),
		modules = [],
		ignoreModules = []; // Ignore under-development modules

	appModuleFiles.forEach(function(moduleFile){
		if(ignoreModules.indexOf(moduleFile) === -1 ){
			var module = require('../../modules/' + moduleFile + '/server/')(System);
			modules.push(module);
		}
	});

	// Attach module routes to app
	modules.forEach(function(module){
		System.log.info('Loaded module: ' + module.routeName);
		System.app.use('/api/' + module.routeName, module.route);
	});

	return modules;
}