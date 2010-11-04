(function($) {
	net = {
		ws: null,
		id: 0,
		error: false,
		_data: {},
		binds: {},
		init: function() {
			if(net.ws) // already inited
			{
				return;
			}
			
			if( ! ('WebSocket' in window))
			{
				return;
			}
			
			net.binds.id = net.binds.id || {
				callback: function(data) {
					net.id = parseInt(data, 10);
				}
			};
			
			net.ws = ws = new WebSocket('ws://'+(/^https?:\/\/([^\/]+)\//.exec(window.location)[1])+':8000');
			
			ws.on = function(event,  callback) {
				ws['on'+event] = callback;
			};
			
			ws.on('message', function(message) {
				var data = message.data, result;
				
				if((result = /^update:(\{.+\})$/.exec(data)))
				{
					data = JSON.parse(result[1]);			
					
					if('id' in data && data.id && data.id != net.id)
					{
						player.opponents[data.id] = player.opponents[data.id] || {x: 15, y: 15};
						player.opponents[data.id].x = data.x;
						player.opponents[data.id].y = data.y;
					}
					return;
				}
				
				if((result = /^response\[([^\]]+)\](?::(.+))?$/.exec(data)))
				{
					if(result[1] in net.binds)
					{
						net.binds[result[1]].callback.call(null, result[2]);
						if(net.binds[result[1]].once)
						{
							delete net.binds[result[1]];
						}
					}
					return;
				}
				
				if((result = /^quit:(\d+)$/.exec(data)))
				{
					if(result[1] in player.opponents)
					{
						delete player.opponents[result[1]];
					}
					return;
				}
				
				if((result = /^error:(.+)$/.exec(data)))
				{
					$.log(data);
				}
			});
			
			ws.on('open', function() {
				net.binds.open.callback.call(null);
				net.flushQueue();
			});
		},
		_queue: [],
		send: function(message, queue) {
			queue = (1 in arguments) ? queue : true;
			
			if(net.ws.readyState !== WebSocket.OPEN)
			{
				queue && net.queue(message);
			}
			else
			{
				net.ws.send(message);
			}
		},
		queue: function(message) {
			net._queue.push(message);
		},
		flushQueue: function() {
			while(net._queue.length)
			{
				net.ws.send(net._queue.shift());
			}
		},
		bind: function() {
			var cmd, once, callback, autosend = true;
			if(arguments.length < 2 || ! (cmd = /^(.+?)(?::(.+))?$/.exec(arguments[0])[1]))
			{
				return false;
			}
			
			switch(arguments.length)
			{
				case 1:
				case 2:
				{
					once = false;
					callback = arguments[1] || $.noop;
					break;
				}
				case 3:
				{
					once = arguments[1];
					callback = arguments[2];
					break;
				}
				case 4:
				{
					once = arguments[1];
					autosend = arguments[2];
					callback = arguments[3];
					break;
				}
			}
			
			net.unbind(cmd);
			net.binds[cmd] = {
				once: once,
				callback: callback
			};
			
			if(autosend)
			{
				net.send(arguments[0]);
			}
			return true;
		},
		unbind: function(cmd) {
			if(cmd in net.binds)
			{
				delete net.binds[cmd];
			}
		}
	};

	$.log('net: ready');
})(jQuery);