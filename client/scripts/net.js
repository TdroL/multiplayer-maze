	net = {
		ws: { send: $.noop },
		id: 0,
		error: false,
		_data: {},
		binds: {},
		host: ('ws://'+(/^https?:\/\/([^\/]+)\//.exec(window.location)[1])+':8000'),
		init: function() {
			if( ! ('WebSocket' in window))
			{
				return;
			}
			
			net._initBinds();
			
			net.ws = ws = net.connect();
			
			ws.on('message', false, function(event) {
				var data = event.data, result;
				
				if((result = /^response\[([^\]]+)\](?::(.+))?$/.exec(data)))
				{
					if(result[1] in net.binds)
					{
						net.binds[result[1]].callback.call(event, result[2]);
						if(net.binds[result[1]].once)
						{
							delete net.binds[result[1]];
						}
					}
					return;
				}
				
				if((result = /^(.+?)(?::(.+))?$/.exec(data)))
				{
					if(result[1] in net.actions)
					{
						net.actions[result[1]].call(event, result[2]);
					}
					return;
				}
			});
			
			ws.on('error', false, function(event) {
				if('error' in net.binds && 'callback' in net.binds.error)
				{
					net.binds.error.callback.call(event);
				}
			});
			
			ws.on('close', false, function(event) {
				if('close' in net.binds && 'callback' in net.binds.close)
				{
					window.setTimeout(function() {
						net.binds.close.callback.call(event);
					}, 5); // call after window.unload
				}
			});
			
			ws.on('open', false, function(event) {
				if('open' in net.binds && 'callback' in net.binds.open)
				{
					net.binds.open.callback.call(event);
				}
				net.flushQueue();
			});
		},
		connect: function() {
			if( ! (net.ws instanceof WebSocket) || net.ws.readyState == WebSocket.CLOSED)
			{
				net.ws = new WebSocket(net.host);
			}
			
			return net.ws;
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