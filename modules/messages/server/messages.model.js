// Message model
'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	MessageSchema;

MessageSchema = new Schema({
	message: String,
	created: {
		type: Date,
		default: Date.now
	},
	channel: {
		type: Schema.ObjectId,
		ref: 'Channel'
	},
	created_by: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

module.exports = mongoose.model('Message', MessageSchema);