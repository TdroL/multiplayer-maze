//(function($) {
	net = {
		ws: null,
		id: 0,
		error: false,
		_data: {},
		binds: {},
		hostUrl: 'ws://'+window.location.host+':8000',
		baseUrl: window.location.pathname.replace(/\/[^\/]*$/, '/'),
		init: function() {
			var self = this;
			
			if ( ! ('WebSocket' in window))
			{
				return;
			}
			
			net._initBinds();
			
			var ws = net.ws = net.connect();
			
			ws.on('message', false, function(event) {
				var data = event.data, result;
				
				if ((result = /^response\[([^\]]+)\](?::(.+))?$/.exec(data)))
				{
					if (result[1] in self.binds)
					{
						self.binds[result[1]].callback.call(event, result[2]);
						if (self.binds[result[1]].once)
						{
							delete self.binds[result[1]];
						}
					}
					return;
				}
				
				if ((result = /^(.+?)(?::(.+))?$/.exec(data)))
				{
					if (result[1] in self.actions)
					{
						self.actions[result[1]].call(event, result[2]);
					}
					return;
				}
			});
			
			ws.on('error', false, function(event) {
				if ('error' in self.binds && 'callback' in self.binds.error)
				{
					self.binds.error.callback.call(event);
				}
			});
			
			ws.on('close', false, function(event) {
				if ('close' in self.binds && 'callback' in self.binds.close)
				{
					self.binds.close.callback.call(event);
				}
			});
			
			ws.on('open', false, function(event) {
				if ('open' in self.binds && 'callback' in self.binds.open)
				{
					self.binds.open.callback.call(event);
				}
				self.flushQueue();
				
				self.send('ping');
			});
		},
		connect: function() {
			if ('WebSocket' in window
			 && ( ! net.ws || net.ws.readyState >= WebSocket.CLOSING))
			{
				net.ws = new WebSocket(net.hostUrl);
			}
			
			return net.ws;
		},
		disconnect: function() {
			if (net.ws && net.ws instanceof WebSocket)
			{
				net.ws.close();
			}
		},
		bufferAvaible: function() {
			if (net.ws && 'bufferedAmount' in net.ws && net.ws.readyState === WebSocket.OPEN)
			{
				return net.ws.bufferedAmount === 0;
			}
			
			return false;
		},
		_queue: [],
		send: function(message, queue) {
			queue = (arguments.length > 1) ? queue : true;
			
			if (queue && ( ! net.ws || net.ws.readyState !== WebSocket.OPEN))
			{
				net.queue(message);
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
			while (net._queue.length)
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
			if (arguments.length < 2 || ! (cmd = /^(.+?)(?::(.+))?$/.exec(arguments[0])[1]))
			{
				return false;
			}
			
			switch(arguments.length)
			{
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
			
			if (autosend)
			{
				net.send(arguments[0]);
			}
			return true;
		},
		bindOnce: function() {
			if (arguments.length === 2)
			{
				return net.bind(arguments[0], true, arguments[1]);
			}
			
			return net.bind(arguments[0], true, arguments[1], arguments[2]);
		},
		removeAction: function() {
			for (var i in arguments)
			{
				var type = arguments[i];
				if (type in net.actions)
				{
					delete net.actions[type];
				}
			}
		},
		removeBind: function() {
			for (var i in arguments)
			{
				var cmd = arguments[i];
				if (cmd in net.binds)
				{
					delete net.binds[cmd];
				}
			}
		},
		url: function(url) {
			return net.baseUrl + url;
		}
	};
	
	/* --debug-begin-- */
	io.log('net: ready');
	/* --debug-end-- */
//})(jQuery);