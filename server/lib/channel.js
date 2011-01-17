var log = require('./log'),
	channels = {};

module.exports = {
	getList: function(raw) {
		if (raw)
		{
			return channels;
		}
		
		var list = [],
			channel;
		
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
	},
	create: function(id, name, limit) {
		return new Channel(id, name, limit);
	}
};

function Channel(id, name, limit)
{
	//this.id = id;
	this.name = name;
	this.limit = limit || 4;
	this.status = 1;
	this.players = {};
	this.count = 0;
	this.pids = [];
	
	// generate pids
	for (var i = 0; i < this.limit; i++)
	{
		this.pids[i] = i+1;
	}
	
	this.add = function(player) {
		log.info('<'+player.id+'> entered channel <'+this.name+'>');
		
		this.broadcast('joined:'+player.id);
		
		player.channel = this;		
		this.players[player.id] = player;
		this.count++;
	};
	
	this.remove = function(player, send) {
		if (player.id in this.players)
		{
			log.info('<'+player.id+'> left channel <'+this.name+'>');
			send && player.send('channel-disconnected:'+id);
			
			player.channel = null;
			delete this.players[player.id];
			this.count--;
			
			this.broadcast('quit:'+player.id);
		}
	};
	
	this.getPid = function() {
		return this.pids.shift();
	};
	
	this.releasePid = function(pid) {
		if (pid > 0 && pid <= this.limit)
		{
			this.pids.push(pid);
			this.pids.sort();
		}
		return 0;
	};
	
	this.broadcast = function(message, not) {
		for (var id in this.players)
		{
			if (not !== id)
			{
				this.players[id].send(message);
			}
		}
	};
	
	this.isAvaible = function() {
		return (this.status > 0 && this.limit > this.count);
	};
	
	this.destruct = function() {
		this.status = -1;
		for (var id in this.players)
		{
			this.remove(this.players[id], true);
		}
	};
}