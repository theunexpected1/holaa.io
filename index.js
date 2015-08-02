var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	_ = require('lodash'),
	bunyan = require('bunyan'),
	port = process.env.PORT || 8080,
	users = {},
	server,
	log = bunyan.createLogger({name: 'holaa'});
	
	server = http.listen(port);
	log.info('listening to server on http://localhost:' + port);

	app.use('/', express.static(__dirname + '/public')); // set the static files location
	app.get('*', function(req, res) {
 		res.sendFile(__dirname + '/public/');
	});

	var socketApp = {
		init: function() {
			var _this = this;
		 	io.on('connection', function(socket) {
		 		log.info('socket:connected!');

		 		// Login listener
				socket.on('login', function(json) {
					_this.onLogin(json, socket);
				});

				socket.on('message', function(json) {
					_this.onMessage(json, socket);
				});

				socket.on('logout', function() {
					_this.disconnect(socket);
				});

				socket.on('disconnect', function() {
					_this.onDisconnect(socket);
				});
 			});
		},

		onLogin: function(json, socket) {
			log.info('socket:login');
			json.timestamp = Date.now();
			log.info({
				login: {
					loginIn: json.channel,
					loginBy: json.user,
					when: json.timestamp
				}
			});
			
			// Ensure '$' prepend before channel name
			json.channel = json.channel.indexOf('$') == 0 ? json.channel : '$' + json.channel;

			// Add to room
			socket.join(json.channel);
			socket.userDetails = json.user;
			socket.channel = json.channel;

			// Add user to users list
			users[json.channel] = users[json.channel] || [];
			users[json.channel].push(json.user);

			// Broadcast new user
			io.to(socket.channel).emit('login', {
				message: 'New user has joined',
				channel: json.channel,
				user: json.user,
				users: users[json.channel]
			});
		},
		onMessage: function(json, socket) {
			log.info('socket:message');
			json.timestamp = Date.now();
			log.info({
				message: {
					messageIn: json.channel,
					messageBy: json.user,
					when: json.timestamp
				}
			});
			io.to(socket.channel).emit('message', json);
		},
		onDisconnect: function(socket) {
			log.info('socket:disconnect');
			// Let everyone, except the initiator, know that a user has left
			socket.broadcast.to(socket.channel).emit('userLeft', socket.userDetails);
			_.remove(users[socket.channel], socket.userDetails);
		},
		disconnect: function(socket) {
			socket.disconnect();
		}
	};

	socketApp.init();