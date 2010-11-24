var sys = require('sys'),
	ws = require('./websocket/lib/ws/server'),
	player = require('./lib/player'),
	channel = require('./lib/channel'),
	channels = channel.getList(true);

var server = ws.createServer().on('listening', function() {
	sys.log('Listening for connections.');
});

channels['channel-1'] = channel.create('channel-1', 'channel #1', 4);
channels['channel-2'] = channel.create('channel-2', 'channel #2', 2);

// Handle WebSocket Requests
server.on('connection', function(conn) {
	sys.log('<'+conn.id+'> connected');
	conn.send('response[id]:'+conn.id);
	
	var self = player.create(conn, server, channels);
	
	
	conn.on('message', function(message) {
		if( ! player.exists(conn.id))
		{
			// ignore message
			return;
		}
		
		var result;
		if((result = /^(.+?)(?::(.+))?$/.exec(message)))
		{
			switch(result[1])
			{
				/*
				case 'ping':
				{
					conn.send('pong');
					self.pong();
					break;
				}
				*/
				case 'get-channels':
				{
					conn.send('response[get-channels]:'+JSON.stringify(channel.getList()));
					break;
				}
				case 'join-channel':
				{
					conn.send('response[join-channel]:'+JSON.stringify(self.join(result[2])));
					break;
				}
				case 'leave-channel':
				{
					self.leave();
					break;
				}
				case 'get-channel-info':
				{
					conn.send('response[get-channel-info]:'+JSON.stringify(channels[result[2]]));
					break;
				}
				case 'clear':
				case 'update':
				{
					if(self.channel)
					{
						self.channel.broadcast(message, conn.id);
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
	
	conn.on('close', function() {
		player.remove(conn.id);
		
		sys.log('<'+conn.id+'> disconnected');
	});
});

server.on('error', function() {
	sys.log(Array.prototype.join.call(arguments, ", "));
});

server.listen(8000);