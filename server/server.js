var players = {},
	channels = {};

var sys = require('sys'),
	ws = require('./websocket/lib/ws/server');

var server = ws.createServer();

server.addListener('listening', function() {
	sys.log('Listening for connections.');
});

/* class */
function Player(conn)
{
	this.id = conn.id;
	this.conn = conn;
	this.channel = null;
	
	var timerID;
	
	this.init = function() {
		this.ping();
	};
	
	this.leave = function() {
		if(this.channel)
		{
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
				return 1;
			}
			return -2;
		}
		return -1;
	};
	
	this.send = function(message) {
		this.conn.send(message);
	};
	
	this.getChannels = function() {
		var list = [], channel;
		for(var id in channels)
		{
			channel = channels[id];
			list.push({
				id: id,
				name: channel.name,
				players: channel.players_i,
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

/* class */
function Channel(id, name, limit)
{
	this.id = id;
	this.name = name;
	this.limit = limit || 4;
	this.status = 1;
	this.players = {};
	this.players_i = 0;
	
	this.add = function(player) {
		//sys.log('Added player <'+player.id+'> to channel <'+this.name+'>');
		
		this.broadcast('joined:'+player.id);
		
		player.channel = this;		
		this.players[player.id] = player;
		this.players_i++;
	};
	
	this.remove = function(player, send) {
		if(player.id in this.players)
		{
			//sys.log('Removed player <'+player.id+'> from channel <'+this.name+'>');
			send && player.send('channel-disconnected:'+this.id);
			
			player.channel = null;
			delete this.players[player.id];
			this.players_i--;
			
			this.broadcast('quit:'+player.id);
		}
	};
	
	this.broadcast = function(message, not) {
		for(var id in this.players)
		{
			if(not !== id)
			{
				this.players[id].send(message);
			}
		}
	};
	
	this.isAvaible = function() {
		return (this.status > 0 && this.limit > this.players_i);
	};
	
	this.destruct = function() {
		this.status = -1;
		for(var id in this.players)
		{
			this.remove(this.players[id], true);
		}
	};
}

channels['channel-1'] = new Channel('channel-1', 'channel #1', 4);
channels['channel-2'] = new Channel('channel-2', 'channel #2', 2);

// Handle WebSocket Requests
server.addListener('connection', function(conn) {
	//sys.log('<'+conn.id+'> connected');
	conn.send('response[id]:'+conn.id);
	
	
	
	players[conn.id] = new Player(conn);
	
	
	conn.addListener('message', function(message) {
		if( ! players[conn.id])
		{
			// ignore message
			return;
		}
		
		var result;
		if((result = /^(.+?)(?::(.+))?$/.exec(message)))
		{
			switch(result[1])
			{
				case 'ping':
				{
					conn.send('pong');
					players[conn.id].pong();
					break;
				}
				case 'get-channels':
				{
					var list = players[conn.id].getChannels();
					conn.send('response[get-channels]:'+JSON.stringify(list));
					
					delete list;
					break;
				}
				case 'join-channel':
				{
					conn.send('response[join-channel]:'+players[conn.id].join(result[2]));
					break;
				}
				case 'leave-channel':
				{
					players[conn.id].leave();
					break;
				}
				case 'get-channel-info':
				{
					conn.send('response[get-channel-info]:'+JSON.stringify(channels[result[2]]));
					break;
				}
				case 'update':
				{
					if(players[conn.id].channel)
					{
						players[conn.id].channel.broadcast(message, conn.id);
					}
					break;
				}
				default:
				{
					conn.send('error: unknown command "'+message+'"');
				}
			}
		}
	});
});

server.addListener('error', function() {
	sys.log(Array.prototype.join.call(arguments, ", "));
});

server.addListener('disconnected', function(conn) {
	//sys.log('<'+conn.id+'> disconnected');
	
	players[conn.id].destruct();
	delete players[conn.id];
});

server.listen(8000);