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
	},
	status: {
		type: String,
		default: 'public'
	},
	created_by: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	total_visits: Number,
	maximum_visitors: Number,
	active_visitors: Number
});

module.exports = mongoose.model('Channel', ChannelSchema);