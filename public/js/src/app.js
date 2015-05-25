// App
'use strict';

angular.module('app', [
	'ngMaterial', 
	'ngAnimate',
	'app.services'
	])
	.config( function($mdThemingProvider){
		$mdThemingProvider.theme('default')
			.primaryPalette('pink')
			.accentPalette('blue')
	})

	.controller('appController', [
		'$scope',
		'socket',
		function($scope, socket){
			var defaultChannelName = '#general';

			$scope.channel = defaultChannelName;
			$scope.user = $scope.users = {};
			$scope.usersNames = "";
			$scope.userReadyToChat = false;
			$scope.messages = [];

			$scope.$watch('users', function(value){
				$scope.usersNames = _.pluck($scope.users, 'name').join(', ');
			});
			/*
			{
				message: 'hey whats up',
				fullName: 'Rahul Vagadiya',
				type: 'user'
			},
			{
				message: 'Rahul Vagadiya just joined',
				fullName: 'admin',
				type: 'bot'
			}
			 */

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
				$scope.initializeConnection();
			};

			$scope.submitMessage = function(){
				if(socket.isConnected()){
					socket.conn.emit('message', {
						fullName: $scope.user.fullName,
						channel: $scope.channel,
						message: $scope.message
					});
					$scope.message = '';
				}
			};

			$scope.initializeConnection = function(){
				socket.connect();
				
				// Enable listeners
				// Login happened
				socket.conn.on('login', function(json){
					console.log('socket:login');
					console.log(json);
					console.log(json.users.length + ' users online');
					console.log(json.users);
					$scope.users = json.users;
					$scope.$apply(function(){
						$scope.messages.push({
							message: json.user.fullName + ' has joined ' + $scope.channel,
							fullName: 'admin',
							type: 'bot'
						});
					});
				});

				// Current user logs out
				socket.conn.on('disconnect', function(json){
					$scope.channel = defaultChannelName;
					$scope.user = $scope.users = {};
					$scope.usersNames = "";
					$scope.userReadyToChat = false;
					$scope.messages = [];
				});

				// On users leaving chat
				socket.conn.on('userLeft', function(json){
					console.log('socket:userLeft');
					console.log(json);
					if(json.channel == $scope.channel){
						$scope.$apply(function(){
							$scope.messages.push({
								message: json.fullName + ' has left this channel!',
								fullName: 'admin',
								type: 'bot'
							});
						});
					}
				});

				// Message popped in
				socket.conn.on('message', function(json){
					console.log('socket:message in ' + json.channel);
					if(json.channel == $scope.channel){
						$scope.$apply(function(){
							$scope.messages.push({
								message: json.message,
								fullName: json.fullName,
								type: 'user'
							});
						});
					}
				});

				// Let them know I am here
				socket.conn.emit('login', {
					fullName: $scope.user.fullName,
					channel: $scope.channel
				});

				
			}
		}
	]);
