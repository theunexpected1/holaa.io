var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	_ = require('lodash'),
	bunyan = require('bunyan'),
	port = process.env.PORT || 8080,
	users = {},
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

		socket.on('login', function(json){
			log.info('socket:login');
			socket.join(json.channel);
			socket.userDetails = json.user;
			socket.channel = json.channel;
			users[json.channel] = users[json.channel] || [];
			users[json.channel].push(json.user);
			io.to(socket.channel).emit('login', {
				message: 'New user has joined',
				channel: json.channel,
				user: json.user,
				users: users[json.channel]
			});
		});

		socket.on('message', function(json){
			log.info('socket:message');
			io.to(socket.channel).emit('message', json);
		});

		socket.on('disconnect', function(){
			log.info('socket:disconnect');
			io.to(socket.channel).emit('userLeft', socket.userDetails);
			_.remove(users, socket.userDetails);
		})
 	});