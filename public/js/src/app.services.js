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
	})
	.service('colors',
		function(){
			var colors = {
				randomizeFromConfig: function(){
					var colors = ['#00838f', '#00695c', '#A9A739', '#259b24', '#01579b', '#c62626', '#3f51b5', '#673ab7', '#f57f17', '#CFB02C', '#FF6D00'];
					return colors[_.random(0, colors.length)];
				}
			};
			return colors;
		}
	)
	.filter('basicHtmlFilter', [
		'$sce',
		function($sce){
			return function(text){
        		return $sce.trustAsHtml(text);
        	};
		}
	]);