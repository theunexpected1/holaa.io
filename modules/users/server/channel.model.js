// Channel model
'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ChannelSchema;

ChannelSchema = new Schema({
	title: String,
	created: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Channel', ChannelSchema);