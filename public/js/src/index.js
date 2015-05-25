// App
'use strict';

var app = angular.module('app', [
	'ngMaterial', 
	'ngAnimate'
	])
	.config( function($mdThemingProvider){
		$mdThemingProvider.theme('default')
			.primaryPalette('pink')
			.accentPalette('blue')
	})

	.controller('appController', [
		'$scope',
		function($scope){
			var defaultChannelName = '#general',
			socket;

			$scope.channel = defaultChannelName;
			$scope.user = {};
			$scope.userReadyToChat = false;
			$scope.messages = [];

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

			$scope.login = function(){
				$scope.userReadyToChat = true;
				socket = window.io();
				
				// Enable listeners
				// Login happened
				socket.on('login', function(users){
					console.log('socket:login');
					console.log(users.length + ' users online');
					console.log(users);
				});

				// Message popped in
				socket.on('message', function(message){
					$scope.messages.push(message);
					console.log('socket:message');
				});

				// Let them know I am here
				socket.emit('login', {
					fullName: $scope.user.fullName,
					channel: $scope.channel
				});
			};

			$scope.submitMessage = function(){

			};
		}
	]);
