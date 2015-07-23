// App
'use strict';

angular.module('app', [
	'ngMaterial',
	'ngAnimate',
	'ui.router',
	'app.services'
	])
	.config([
		'$mdThemingProvider',
		'$locationProvider',
		'$urlRouterProvider',
		'$stateProvider',
		function($mdThemingProvider, $locationProvider, $urlRouterProvider, $stateProvider) {
			$mdThemingProvider.theme('default')
				// .primaryPalette('pink')
				// .accentPalette('blue')

			// $locationProvider.html5Mode(true);

			$locationProvider.html5Mode({
			  enabled: true,
			  requireBase: false
			});

			$stateProvider
				.state('home', {
					url: '/',
					controller: 'appController'
				})
				.state('channel', {
					url: '/$:channel',
					controller: 'appController'
				})
				.state('channelUser', {
					url: '/$:channel/:user',
					controller: 'appController'
				});

			$urlRouterProvider.otherwise('/');
		}
	])

	.controller('appController', [
		'$scope',
		'$stateParams',
		'$mdSidenav',
		'$sce',
		'$location',
		'$anchorScroll',
		'socket',
		'colors',
		function($scope, $stateParams, $mdSidenav, $sce, $location, $anchorScroll, socket, colors){
			// Setup Initials
			var defaultChannelName = '$general';

			$scope.$watch('users', function(value){
				$scope.usersNames = _.pluck($scope.users, 'fullName').join(', ');
			});
			/*
			Message format:
			{
				message: 'hey whats up',
				user: {fullName: 'Rahul Vagadiya', color: '#f0f0f0'},
				type: 'user'
			},
			{
				message: 'Rahul Vagadiya just joined',
				user: {fullName: 'admin', color: 'black'},
				type: 'bot'
			}
			*/

			$scope.$watch('channel', function(value){
				$scope.channel = $scope.fixChannelName(value, false);
			});

			/**
			 * Ensures channel names follow formatting
			 * @param  {String} value         Channel name
			 * @param  {Boolean} checkForEmpty Should the method check if channel name is passed in as empty or not
			 * @return {String}               Formatted channel name
			 */
			$scope.fixChannelName = function(value, checkForEmpty){
				if(checkForEmpty && (!value || value === '' || value === '$')){
					value = defaultChannelName;
				}
				$scope.channel = value.indexOf('$') == 0 ? value : '$' + value;
				return value;
			};

			/**
			 * Login to a specific channel
			 * @return {null}
			 */
			$scope.login = function(){
				$location.path($scope.channel + '/' + $scope.user.fullName);
			};

			/**
			 * Logout from channel
			 * @return {null}
			 */
			$scope.logout = function(){
				if(socket && socket.conn){
					socket.conn.close();
				}
			};

			/**
			 * Send a message from client
			 * @return {[type]} [description]
			 */
			$scope.submitMessage = function(){
				if(socket.isConnected()){
					socket.conn.emit('message', {
						user: $scope.user,
						channel: $scope.channel,
						message: $scope.message
					});
					$scope.message = '';
				}
			};

			/**
			 * Show hide the channel information / the sidebar. Only applicable on mobile, always visible on tablet/desktop
			 * @return {null}
			 */
			$scope.toggleChannelInformation = function(){
				$mdSidenav('active-users').toggle();
			}

			$scope.toggleHelp = function(){
				$scope.helpShown = !$scope.helpShown;
			}

			/**
			 * Scroll to a given hash. Gracefully fails if element is non-existent
			 * @param  {String} hash hash of the element to scroll to
			 * @return {null}
			 */
			$scope.scrollTo = function(hash){
				$anchorScroll(hash);
			}

			/**
			 * Connect to the socket and enable listeners. Also, log the user in via socket
			 * @return {null}
			 */
			$scope.initializeConnection = function(){
				// Connect to the socket
				socket.connect();
				
				// Enable listeners
				// Login happened
				socket.conn.on('login', function(json){
					console.log('socket:login');
					$scope.users = json.users;
					$scope.$apply(function(){
						$scope.messages.push({
							message: '<span style="color:' + json.user.color + '">' + json.user.fullName + '</span> has joined ' + $scope.channel,
							user: {name: 'admin', color: 'black'},
							type: 'bot'
						});
					});
				});

				// On users leaving chat
				socket.conn.on('userLeft', function(user){
					console.log('socket:userLeft');
					console.log(user);
					$scope.$apply(function(){
						_.remove($scope.users, user);
						$scope.messages.push({
							message: user.fullName + ' has left this channel!',
							user: {name: 'admin', color: 'black'},
							type: 'bot'
						});
					});
				});

				// Message popped in
				socket.conn.on('message', function(json){
					console.log('socket:message in ' + json.channel);
					if(json.channel == $scope.channel){
						$scope.$apply(function(){
							$scope.messages.push({
								message: json.message,
								user: json.user,
								timestamp: json.timestamp,
								type: 'user'
							});

							// Scroll to bottom on every message
							if($scope.isScrolledToBottom){
								$scope.scrollTo('bottom');
							}
						});
					}
				});

				// Logout user on disconnection
				socket.conn.on('disconnect', function(){
					$location.path('/');
				});

				// Send initial message
				// Let them know I am here
				socket.conn.emit('login', {
					user: $scope.user,
					channel: $scope.channel
				});
				
			}

			// Initialize
			$scope.initialize = function(){
				$scope.appReady = true;
				$scope.logout();
				$scope.channel = $stateParams.channel || defaultChannelName;
				$scope.user = $stateParams.user ? {fullName: $stateParams.user} : {};
				$scope.users = [];
				$scope.usersNames = "";
				$scope.userReadyToChat = false;
				$scope.messages = [];
				$scope.isScrolledToBottom = true;
				$scope.helpShown = false;
				if($scope.channel && $scope.user.fullName){
					// Give the user's name a unique color
					$scope.user.color = colors.randomizeFromConfig();
					$scope.userReadyToChat = true;
					$scope.initializeConnection();
				}
			};
			$scope.initialize();
		}
	]);