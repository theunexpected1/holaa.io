var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
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
 			io.sockets.emit('login', users);
 		});
 		
 	});