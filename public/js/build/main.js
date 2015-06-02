(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Applications/MAMP/htdocs/interactive/public/js/src/app.js":[function(require,module,exports){
// App
'use strict';

angular.module('app', [
	'ngMaterial', 
	'ngAnimate',
	'app.services'
	])
	.config( function($mdThemingProvider){
		$mdThemingProvider.theme('default')
			// .primaryPalette('pink')
			// .accentPalette('blue')
	})

	.controller('appController', [
		'$scope',
		'$mdSidenav',
		'$sce',
		'$location',
		'$anchorScroll',
		'socket',
		'colors',
		function($scope, $mdSidenav, $sce, $location, $anchorScroll, socket, colors){
			// Setup Initials
			var defaultChannelName = '#general';
			$scope.reset = function(){
				$scope.channel = defaultChannelName;
				$scope.user = {};
				$scope.users = [];
				$scope.usersNames = "";
				$scope.userReadyToChat = false;
				$scope.messages = [];
				$scope.isScrolledToBottom = true;
			}

			$scope.reset();

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
				if(checkForEmpty && (!value || value === '' || value === '#')){
					value = defaultChannelName;
				}
				$scope.channel = value.indexOf('#') == 0 ? value : '#' + value;
				return value;
			};

			/**
			 * Login to a specific channel
			 * @return {null}
			 */
			$scope.login = function(){
				// Give the user's name a unique color
				$scope.user.color = colors.randomizeFromConfig();
				$scope.userReadyToChat = true;
				$scope.initializeConnection();
			};

			/**
			 * Logout from channel
			 * @return {null}
			 */
			$scope.logout = function(){
				socket.conn.close();
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
					console.log('socket:disconnected');
					if ($scope.$$phase) {
						$scope.reset();
					} else{
						$scope.$apply(function(){
							$scope.reset();
						});
					}
				});

				// Send initial message
				// Let them know I am here
				socket.conn.emit('login', {
					user: $scope.user,
					channel: $scope.channel
				});
				
			}
		}
	]);

},{}],"/Applications/MAMP/htdocs/interactive/public/js/src/app.services.js":[function(require,module,exports){
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
},{}]},{},["/Applications/MAMP/htdocs/interactive/public/js/src/app.js","/Applications/MAMP/htdocs/interactive/public/js/src/app.services.js"]);
