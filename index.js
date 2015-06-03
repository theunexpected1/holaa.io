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

	// Login listener
	socket.on('login', function(json){
		log.info('socket:login');
		
		// Ensure '#' prepend before channel name
		json.channel = json.channel.indexOf('#') == 0 ? json.channel : '#' + json.channel;

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
	});

	// Incoming message listener
	socket.on('message', function(json){
		log.info('socket:message');
		json.timestamp = Date.now();
		io.to(socket.channel).emit('message', json);
	});

	socket.on('logout', function(){
		socket.disconnect();
	});

	// Disconnect listener
	socket.on('disconnect', function(){
		log.info('socket:disconnect');
		// Let everyone, except the initiator, know that a user has left
		socket.broadcast.to(socket.channel).emit('userLeft', socket.userDetails);
		_.remove(users[socket.channel], socket.userDetails);
	})
});