// App

var app = angular.module('app', ['ngMaterial'])
	.config( function($mdThemingProvider){
	// Configure a dark theme with primary foreground yellow
		$mdThemingProvider.theme('default')
			.primaryPalette('pink')
			.accentPalette('blue')
	})
	.controller('appController', [
		'$scope', 
		function($scope){
			$scope.channel = '#general';
			$scope.user = {};
			$scope.$watch('channel', function(value){
				$scope.channel = value.indexOf('#') == 0 ? value : '#' + value;
			});
		}
	]);