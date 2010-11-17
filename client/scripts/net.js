(function($) {
	net = {
		ws: null,
		id: 0,
		error: false,
		_data: {},
		binds: {},
		host: ('ws://'+(/^https?:\/\/([^\/]+)\//.exec(window.location)[1])+':8000'),
		init: function() {
			var self = this,
				pong = net.ping(),
				pongID = 0;
			
			if( ! ('WebSocket' in window))
			{
				return;
			}
			
			net._initBinds();
			
			net.action('pong', function() {
				pong();
				
				pongID = window.setTimeout(function() {
					net.send('ping');
				}, 2000);
			});
			
			var ws = net.ws = net.connect();
			
			ws.on('message', false, function(event) {
				var data = event.data, result;
				
				if((result = /^response\[([^\]]+)\](?::(.+))?$/.exec(data)))
				{
					if(result[1] in self.binds)
					{
						self.binds[result[1]].callback.call(event, result[2]);
						if(self.binds[result[1]].once)
						{
							delete self.binds[result[1]];
						}
					}
					return;
				}
				
				if((result = /^(.+?)(?::(.+))?$/.exec(data)))
				{
					if(result[1] in self.actions)
					{
						self.actions[result[1]].call(event, result[2]);
					}
					return;
				}
			});
			
			ws.on('error', false, function(event) {
				if('error' in self.binds && 'callback' in self.binds.error)
				{
					self.binds.error.callback.call(event);
				}
			});
			
			ws.on('close', false, function(event) {
				pong(false); // disable pong
				window.clearTimeout(pongID);
				
				if('close' in self.binds && 'callback' in self.binds.close)
				{
					window.setTimeout(function() {
						self.binds.close.callback.call(event);
					}, 100); // call after window.unload
				}
			});
			
			ws.on('open', false, function(event) {
				if('open' in self.binds && 'callback' in self.binds.open)
				{
					self.binds.open.callback.call(event);
				}
				self.flushQueue();
				
				self.send('ping');
			});
		},
		connect: function() {
			if('WebSocket' in window
			 && ( ! (net.ws instanceof WebSocket) || net.ws.readyState === WebSocket.CLOSED))
			{
				net.ws = new WebSocket(net.host);
			}
			
			return net.ws;
		},
		disconnect: function() {
			if('WebSocket' in window
			 && net.ws instanceof WebSocket && net.ws.readyState !== WebSocket.CLOSED)
			{
				net.ws.close();
			}
		},
		bufferAvaible: function() {
			if(net.ws && 'bufferedAmount' in net.ws && net.ws.readyState === WebSocket.OPEN)
			{
				return net.ws.bufferedAmount === 0;
			}
			
			return false;
		},
		ping: function() {
			var timer;
			return function (disable) {
				window.clearTimeout(timer);
				if(disable) return;
				timer = window.setTimeout(function(){
					net.ws.close();
					if('close' in net.binds && 'callback' in net.binds.close)
					{
						net.binds.close.callback.call(null);
					}
				}, 10000); 
			};
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
		actions: {},
		action: function(type, callback) {
			net.actions[type] = callback;
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
		_initBinds: function() {
			net.binds.id = net.binds.id || {
				callback: function(data) {
					net.id = parseInt(data, 10);
				}
			};
			
			net.binds.open = net.binds.open || {
				callback: $.noop
			};
			
			net.binds.close = net.binds.close || {
				callback: $.noop
			};
			
			net.binds.error = net.binds.error || {
				callback: $.noop
			};
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
			
			net.removeBind(cmd);
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
		removeBind: function(cmd) {
			if(cmd in net.binds)
			{
				delete net.binds[cmd];
			}
		}
	};
	
	if('WebSocket' in window)
	{
		WebSocket.prototype.on = WebSocket.prototype.on || function(event) {
			if(typeof arguments[1] === 'boolean' && ! arguments[1])
			{
				this['on'+event] = this['on'+event] || arguments[2];
			}
			else
			{
				this['on'+event] = arguments[1];
			}
		};
	}

	$.log('net: ready');
})(jQuery);