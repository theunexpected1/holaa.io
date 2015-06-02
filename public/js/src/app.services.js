// App services
'use strict';

angular.module('app.services', [])
	.factory('socket', function(){
		var obj = {
			conn: null,
			connect: function(){
				this.conn = window.io({
					'forceNew': true
				});
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
	])
	.directive('appScrollBinding',[
		function(){
			return function(scope, element, attrs){
				// Check if the user is scrolled to the bottom of messages, or they may be reading the messages by scrolling up.
				// This is mainly to test if on loading of new messages, should the app show the user with new message by auto scrolling them to bottom or not
				angular.element(element).bind('scroll', function(){
					var offset = 100;
					if((this.scrollHeight - offset) <= (this.offsetHeight + this.scrollTop)){
						scope.isScrolledToBottom = true;
					} else{
						scope.isScrolledToBottom = false;
					}
					scope.$apply();
				});
			}
		}
	]);