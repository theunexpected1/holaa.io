// App

var app = angular.module('app', ['ngMaterial', 'ngAnimate'])
	.config( function($mdThemingProvider){
		$mdThemingProvider.theme('default')
			.primaryPalette('pink')
			.accentPalette('blue')
	})
	.controller('appController', [
		'$scope',
		function($scope){
			$scope.channel = '#general';
			$scope.user = {};
			$scope.userReadyToChat = false;
			$scope.$watch('channel', function(value){
				$scope.channel = value.indexOf('#') == 0 ? value : '#' + value;
			});

			$scope.enterChat = function(){
				$scope.userReadyToChat = true;
			};
		}
	]);
	