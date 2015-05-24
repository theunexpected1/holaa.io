var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	port = 8080,
	server;
	
	server = http.listen(port);
 	console.log('listening to server on http://localhost:' + port);

 	app.use(express.static('public'));
 	
 	app.get('/', function(req, res){
 		console.log('hello');
 		res.sendFile(__dirname + '/public/views/index.html');
 	});

 	io.on('connection', function(socket){
 		console.log('connected!');
 		socket.on('info', function(data){
 			console.log('received data:');
 			console.log(data);
 		});
 		setInterval(function(){
 			socket.emit('info', {
 				test: 'data'
 			});
 			console.log('here');
 		}, 1000);
 	});
