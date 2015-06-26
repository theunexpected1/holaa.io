// Channels model
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
	total_visits: {
		type: Number,
		default: 0
	},
	maximum_visitors: {
		type: Number,
		default: 0
	},
	active_visitors: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('Channel', ChannelSchema);