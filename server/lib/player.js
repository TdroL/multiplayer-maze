var players = {};

module.exports = {
	create: function(conn, server, channels) {
		this.remove(conn.id);
		players[conn.id] = new Player(conn, server, channels);
		return players[conn.id];
	},
	remove: function(id) {
		if (this.exists(id))
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
	this.status = false;
	
	this.init = function() {
		
	};
	
	this.leave = function(silent) {
		
		this.status = false;
		
		if (this.channel)
		{
			silent = silent || false;
			this.pid = this.channel.releasePid(this.pid);
			this.channel.remove(this, false, silent);
		}
	};
	
	this.join = function(id) {
		var channel;
		if (id in channels)
		{
			channel = channels[id];
			
			this.leave();
			
			if (channel.isAvaible())
			{
				channel.add(this);
				this.pid = channel.getPid();
				this.status = false;
				
				return [1, this.pid];
			}

			if (channel.in_progress)
			{
				return [-3];
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
		for (var id in channels)
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
	
	this.getInfo = function() {
		var self = this;
		return {
			id: self.id,
			pid: self.pid,
			status: self.status
		};
	};
	
	this.destruct = function() {
		this.leave();
	};
	
	this.init();
}