(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Applications/MAMP/htdocs/holaa.io/public/js/src/app.js":[function(require,module,exports){
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
				.state('about', {
					url: '/about',
					controller: 'appController'
				})
				.state('channel', {
					url: '/$:channel',
					controller: 'appController'
				})
				.state('channelUser', {
					url: '/$:channel/:fullName',
					controller: 'appController'
				});

			$urlRouterProvider.otherwise('/');
		}
	])

	.controller('appController', [
		'$scope',
		'$state',
		'$stateParams',
		'$mdSidenav',
		'$sce',
		'$timeout',
		'$location',
		'socket',
		'colors',
		'storage',
		'randomChannel',
		function($scope, $state, $stateParams, $mdSidenav, $sce, $timeout, $location, socket, colors, storage, randomChannel){
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

			$scope.switchChannel = function(channelName){
				$scope.fixChannelName(channelName);
			}

			/**
			 * Login to a specific channel
			 * @return {Void}
			 */
			$scope.login = function(form){
				if(form.$valid) {
					$location.path($scope.channel + '/' + $scope.user.fullName);
				}
			};

			/**
			 * Logout from channel and redirect to channel page if it exists (which it should), otherwise root
			 * @return {Void}
			 */
			$scope.logout = function(){
				$scope.disconnect();
				$location.path($scope.channel || '/');
			};

			/**
			 * Disconnect the socket connection if it exists
			 * @return   {Void}
			 */
			$scope.disconnect = function(){
				if(socket && socket.conn){
					socket.conn.close();
				}
			}

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
			 * @return {Void}
			 */
			$scope.toggleChannelInformation = function(){
				$mdSidenav('active-users').toggle();
			}

			$scope.toggleHelp = function(){
				$scope.helpShown = !$scope.helpShown;
			}

			/**
			 * Scroll to a the bottom of chat messages.
			 * @return {Void}
			 */
			$scope.scrollToBottom = function(){
				$timeout(function(){
					if($scope.isScrolledToBottom){
						var $elem = $('.chat-message-container');
						$elem.scrollTop($elem[0].scrollHeight);
					}
				});
			}

			/**
			 * Connect to the socket and enable listeners. Also, log the user in via socket
			 * @return {Void}
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
						// Scroll to bottom on every message, even bot messages
						$scope.scrollToBottom();
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
							$scope.scrollToBottom();
						});
					}
				});

				// Do nothing explicitly on disconnection
				socket.conn.on('disconnect', angular.noop);

				// Send initial message
				// Let them know I am here
				socket.conn.emit('login', {
					user: $scope.user,
					channel: $scope.channel
				});
				
			}

			// Initialize
			$scope.initialize = function(){
				// Identify User's name
				var userFullName = $stateParams.fullName ? $stateParams.fullName : storage.get('user.fullName');
				if(userFullName && storage.get('user.fullName') !== userFullName){
					storage.set('user.fullName', userFullName);
				}

				$scope.appReady = true;
				$scope.disconnect();
				$scope.channel = $stateParams.channel || defaultChannelName;
				$scope.user = userFullName ? {fullName: userFullName} : {};

				$scope.users = [];
				$scope.usersNames = "";
				$scope.userReadyToChat = false;
				$scope.messages = [];
				$scope.isScrolledToBottom = true;
				$scope.helpShown = false;
				$scope.randomChannel1 = randomChannel.generate();
				$scope.randomChannel2 = randomChannel.generate();
				if($stateParams.channel && $stateParams.fullName){
					// Give the user's name a unique color
					$scope.user.color = colors.randomizeFromConfig();
					$scope.userReadyToChat = true;
					$scope.initializeConnection();
				}
				if($state.current.name === 'about'){
					$scope.helpShown = true;
				}
			};
			$scope.initialize();
		}
	]);
},{}],"/Applications/MAMP/htdocs/holaa.io/public/js/src/app.services.js":[function(require,module,exports){
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
	/**
	 * Factory to manage local storage
	 * @return   {Object} Local Storage Manager
	 * @memberOf kal.{[namespace]}
	 */
	.factory('storage', [
		'$window',
		'$rootScope',
		function($window, $rootScope) {
		  return {
		    set: function(key, val) {
		      $window.localStorage && $window.localStorage.setItem(key, val);
		      return this;
		    },
		    get: function(key) {
		      return $window.localStorage && $window.localStorage.getItem(key);
		    },
		    remove: function(key) {
		      return $window.localStorage && $window.localStorage.removeItem(key);
		    }
		  };
		}
	])
	/**
	 * Generate random channel name (5 characters)
	 */
	.factory('randomChannel', function(){
		return {
			generate: function() {
		    	var text = "";
		    	var limit = 5;
			    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			    for (var i=0; i<limit; i++)
			        text += possible.charAt(Math.floor(Math.random() * possible.length));
			    return text;
			}
		};
	})
	/**
	 * General random user color
	 */
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
	])
	/**
	 * Factory to check if device is mobile / tablet
	 */
	.factory('isMobileOrTablet', function(){
		return function(){
		  var check = false;
		  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		  return check;
		}
	})
	/**
	 * Auto focus directive
	 */
	.directive('autoFocus', ['$parse', '$timeout', 'isMobileOrTablet', function($parse, $timeout, isMobileOrTablet){
		return {
			restrict: 'A',
			link: function link(scope, element, attrs){
				// Do not perform auto focus
				if (isMobileOrTablet()){
					return;
				}
				var model = $parse(attrs.autoFocus);
				scope.$watch(model, function(value){
					if(value === true){
						$timeout(function(){
							element[0].focus();
						});
					}
				});
			}
		}
	}]);
},{}]},{},["/Applications/MAMP/htdocs/holaa.io/public/js/src/app.js","/Applications/MAMP/htdocs/holaa.io/public/js/src/app.services.js"]);
