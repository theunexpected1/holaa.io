// User model
'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	UserSchema;

UserSchema = new Schema({
	fullName: String,
	channel: {
		type: Schema.ObjectId,
		ref: 'Channel'
	},
	email: String,
	created: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('User', UserSchema);