var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	_ = require('lodash'),
	port = 8080,
	users = [],
	server;
	
	server = http.listen(port);
	console.log('listening to server on http://localhost:' + port);

 	app.use(express.static('public'));

 	app.get('/', function(req, res){
 		res.sendFile(__dirname + '/public/views/index.html');
 	});

 	io.on('connection', function(socket){
 		console.log('socket:connected!');

		socket.on('login', function(user){
			console.log('socket:login');
			users.push(user);
			socket.userDetails = user;
			io.sockets.emit('login', {
				message: 'New user has joined',
				user: user,
				users: users
			});
			console.log(socket);
		});

		socket.on('message', function(json){
			console.log('socket:message');
			io.sockets.emit('message', json);
		});

		socket.on('disconnect', function(){
			console.log('socket:disconnect');
			io.sockets.emit('userLeft', socket.userDetails);
			_.remove(users, socket.userDetails);
		})
 	});