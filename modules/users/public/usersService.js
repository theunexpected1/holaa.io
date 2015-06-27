// Users Service
'use strict';

angular.module('app.users')
	.factory('User', [
		'$resource',
		function($resource){
			return $resource('/api/users/:id');
		}
	]);