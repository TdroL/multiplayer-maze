var sys = require('sys'),
	players = {};

module.exports = {
	create: function(conn, server, channels) {
		this.remove(conn.id);
		players[conn.id] = new Player(conn, server, channels);
		return players[conn.id];
	},
	remove: function(id) {
		if(this.exists(id))
		{
			players[id].destruct();
			delete players[id];
		}
	},
	exists: function(id) {
		return id in players;
	}
};

function Player(conn, server, channels)
{
	this.id = conn.id;
	this.pid = 0;
	this.channel = null;
	
	var timerID;
	
	this.init = function() {
		this.ping();
	};
	
	this.leave = function() {
		if(this.channel)
		{
			this.pid = this.channel.releasePid(this.pid);
			this.channel.remove(this);
		}
	};
	
	this.join = function(id) {
		var channel;
		if(id in channels)
		{
			channel = channels[id];
			
			this.leave();
			
			if(channel.isAvaible())
			{
				channel.add(this);
				this.pid = channel.getPid();
				return [1, this.pid];
			}
			return [-2];
		}
		return [-1];
	};
	
	this.send = function(message) {
		conn.send(message);
	};
	
	this.getChannels = function() {
		var list = [], channel;
		for(var id in channels)
		{
			channel = channels[id];
			list.push({
				id: id,
				name: channel.name,
				players: channel.count,
				limit: channel.limit
			});
		}
		
		return list;
	};
	
	this.pong = function() {};
	this.ping = function() {
		var parent = this;
		
		this.pong = function(disable) {
			clearTimeout(timerID);
			if(disable) return;
			
			timerID = setTimeout(function() {
				server.emit('disconnected', parent.conn);
			}, 10000);
		};
		
		this.pong();
	};
	
	this.destruct = function() {
		clearTimeout(timerID);
		this.leave();
	};
	
	this.init();
}