var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	_ = require('lodash'),
	bunyan = require('bunyan'),
	port = 8080,
	users = [],
	server,
	log = bunyan.createLogger({name: 'interactive'});
	
	server = http.listen(port);
	log.info('listening to server on http://localhost:' + port);

 	app.use(express.static('public'));

 	app.get('/', function(req, res){
 		res.sendFile(__dirname + '/public/views/index.html');
 	});

 	io.on('connection', function(socket){
 		log.info('socket:connected!');

		socket.on('login', function(user){
			log.info('socket:login');
			users.push(user);
			socket.userDetails = user;
			io.sockets.emit('login', {
				message: 'New user has joined',
				user: user,
				users: users
			});
		});

		socket.on('message', function(json){
			log.info('socket:message');
			io.sockets.emit('message', json);
		});

		socket.on('disconnect', function(){
			log.info('socket:disconnect');
			io.sockets.emit('userLeft', socket.userDetails);
			_.remove(users, socket.userDetails);
		})
 	});