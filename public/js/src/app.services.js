// App services
'use strict';

angular.module('app.services', [])
	.factory('socket', function(){
		var obj = {
			conn: null,
			connect: function(){
				this.conn = window.io();
			},
			isConnected: function(){
				return this.conn !== null;
			}
		};
		return obj;
	});