var sys = require('sys'),
	ws = require('./websocket/lib/ws/server'),
	player = require('./lib/player'),
	channel = require('./lib/channel'),
	log = require('./lib/log'),
	channels = channel.getList(true);

log.info(null, '--------------------------------------------------------');
log.info('Starting server');

var server = ws.createServer().on('listening', function() {
	log.info('Listening for connections.');
});

channel.create('channel-1', 'channel #1', 2, 'test.txt');
channel.create('channel-2', 'channel #2', 2, 'test.txt');

// Handle WebSocket Requests
server.on('connection', function(conn) {
	log.info('<'+conn.id+'> connected');
	conn.send('response[id]:'+conn.id);
	
	var self = player.create(conn, server, channels);
	
	conn.on('message', function(message) {
		if ( ! player.exists(conn.id))
		{
			// ignore message
			return;
		}
		
		var result;
		if ((result = /^(.+?)(?::(.+))?$/.exec(message)))
		{
			switch (result[1])
			{
				case 'get-channels':
				{
					if (self.channel)
					{
						break;
					}
					
					conn.send('response[get-channels]:'+JSON.stringify(channel.getList()));
					break;
				}
				case 'change-status':
				{
					if ( ! self.channel)
					{
						break;
					}
					
					self.status = (result[2] == 'ready');
					
					self.channel.broadcast('status-changed:'+JSON.stringify({ id: self.id, status: self.status }), conn.id);
					
					if (self.channel.playersReady() && ! self.channel.in_progress)
					{
						self.channel.in_progress = true;
						self.channel.broadcast('start-game:'+JSON.stringify({ time: +new Date() }));
					}
					
					break;
				}
				case 'join-channel':
				{
					if (self.channel)
					{
						break;
					}
					
					conn.send('response[join-channel]:'+JSON.stringify(self.join(result[2])));
					
					if (self.channel)
					{
						self.channel.broadcast('joined-channel:'+JSON.stringify(self.getInfo()), conn.id);
					}
					break;
				}
				case 'silent-leave-channel':
				case 'leave-channel':
				{
					if ( ! self.channel)
					{
						break;
					}
					
					self.leave(result[1] == 'silent-leave-channel');
					break;
				}
				case 'get-channel-info':
				{
					if ( ! self.channel)
					{
						break;
					}
					
					if (result[2] in channels)
					{
						var ch = channels[result[2]],
							response = {
								name: ch.name,
								limit: ch.limit,
								status: ch.status,
								count: ch.count,
								map: ch.map,
								players: []
							};
						
						if (ch.count > 0)
						{
							for (var i in ch.players)
							{
								response.players.push(ch.players[i].getInfo());
							}
						}
						
						conn.send('response[get-channel-info]:'+JSON.stringify(response));
					}
					break;
				}
				case 'finished':
				case 'clear':
				case 'update':
				{
					if ( ! self.channel)
					{
						break;
					}
					
					self.channel.broadcast(message, conn.id);
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
		
		log.info('<'+conn.id+'> disconnected');
	});
});

server.on('error', function() {
	log.info(Array.prototype.join.call(arguments, ', '));
});

server.listen(8000);