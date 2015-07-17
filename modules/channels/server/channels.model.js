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

ChannelSchema.virtual('user').set(function(user){
	console.log('virtual user');
	var User = mongoose.model('User');
	var _this = this;
	User
		.findOne({fullName: user.fullName})
		.exec(function(err, user){
			_this.created_by = user
		});
}).get(function(){
	return this.created_by;
});

ChannelSchema.pre('save', function (next) {
	var _this = this;
	console.log('channel presave');
	if(_this.isNew){
		mongoose.models['Channel'].findOne({title : _this.title}, function(err, channel) {
			if(err) {
				next(err);
			} else if(channel) {
				channel.addVisitor();
				channel.save();
				_this.invalidate('title', 'Channel already exists');
			} else {
				_this.addVisitor();
				next();
			}
		});
	} else{
		next();
	}
});

ChannelSchema.methods.addVisitor = function(){
	console.log('adding visitor');
	this.total_visits++;
	this.active_visitors++;
	this.maximum_visitors = Math.max(this.maximum_visitors, this.active_visitors);
};

ChannelSchema.methods.removeVisitor = function(){
	this.active_visitors--;
}

module.exports = mongoose.model('Channel', ChannelSchema);