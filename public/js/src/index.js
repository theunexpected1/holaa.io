// App

var app = angular.module('app', ['ngMaterial', 'ngAnimate'])
	.config( function($mdThemingProvider){
		$mdThemingProvider.theme('default')
			.primaryPalette('pink')
			.accentPalette('yellow')
	})
	.controller('appController', [
		'$scope',
		function($scope){
			var defaultChannelName = '#general';
			$scope.channel = defaultChannelName;
			$scope.user = {};
			$scope.userReadyToChat = false;
			$scope.$watch('channel', function(value){
				$scope.channel = $scope.fixChannelName(value, false);
			});

			$scope.fixChannelName = function(value, checkForEmpty){
				if(checkForEmpty && (!value || value === '' || value === '#')){
					value = defaultChannelName;
				}
				$scope.channel = value.indexOf('#') == 0 ? value : '#' + value;
				return value;
			};

			$scope.enterChat = function(){
				$scope.userReadyToChat = true;
			};
		}
	]);
