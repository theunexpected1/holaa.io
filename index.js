// App

// Modules
var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	_ = require('lodash'),
	bunyan = require('bunyan'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	config = require('./system/config/' + process.env.NODE_ENV),
	db,
	users = {},
	server,
	System = {
		app: app,
		express: express,
		log: bunyan.createLogger({name: 'interactive'}),
		helpers: {},
		modules: {}
	},
	helpers = require('./system/helpers/'),
	modules = require('./system/modules/');


// Middlewares
app.use('/', express.static('public'));
app.use('/modules/', express.static('modules'));
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/views/index.html');
});

// Initialize System object
System.helpers = helpers(System);
System.modules = modules(System);

// Database connection
db = mongoose.connect(config.db);
mongoose.connection.on('open', function(){
	System.log.info('db connected');
});
mongoose.connection.on('error', function(){
	System.log.error('db connection failed!');
});

// Initialization
server = http.listen(config.port);
System.log.info('listening to server on http://localhost:' + config.port);

// Socket connection
io.on('connection', function(socket){
	System.log.info('socket:connected!');

	// Login listener
	socket.on('login', function(json){
		System.log.info('socket:login');
		
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
		System.log.info('socket:message');
		json.timestamp = Date.now();
		io.to(socket.channel).emit('message', json);
	});

	socket.on('logout', function(){
		socket.disconnect();
	});

	// Disconnect listener
	socket.on('disconnect', function(){
		System.log.info('socket:disconnect');
		// Let everyone, except the initiator, know that a user has left
		socket.broadcast.to(socket.channel).emit('userLeft', socket.userDetails);
		_.remove(users[socket.channel], socket.userDetails);
	})
});