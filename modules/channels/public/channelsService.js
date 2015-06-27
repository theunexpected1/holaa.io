// Channels Service
'use strict';

angular.module('app.channels')
	.factory('Channel', [
		'$resource',
		function($resource){
			return $resource('/api/channels/:id');
		}
	]);