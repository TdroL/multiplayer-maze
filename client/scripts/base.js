var pro, config, io, net, ui, phy, state, obj;

//(function($) {
	if( ! console)
	{
		console = { log: function() {}, error: function() {} };
	}
	
	/* --debug-begin-- */
	window.debug = true;
	
	$.log = function() {
		window.debug && console.log.apply(console, arguments);
	};
	$.error = function() {
		if(window.debug)
		{
			console.error.apply(console, arguments);
			alert('Error: '+Array.prototype.join.call(arguments, ''));
		}
		throw Array.prototype.join.call(arguments, '');
	};
	/* --debug-end-- */
	
	config = {
		base_url: '/multiplayer/',
		runTest: function() {
			return ('WebSocket' in window) && ( !! document.createElement('canvas').getContext);
		}
	};
	
	Array.prototype.empty = Array.prototype.empty || function() {
		this.splice(0, this.length);
		return this;
	};
	
	Array.prototype.merge = Array.prototype.merge || function(arr) {
		while(arr.length)
		{
			this.push(arr.shift());
		}
		return this;
	};
	
	String.prototype.url = function() {
		return config.base_url + this;
	};
	
	
	Math.sgn = Math.sgn || function(x) {
		if(x < 0) return -1;
		if(x > 0) return 1;
		return 0;
	};
	
	Math.round2 = Math.round2 || function(x, t) {
		t = t || 1;
		var pt = Math.pow(10, t);
		return Math.round(x*pt)/pt;
	};
	
	Math.dist = Math.dist || function(p1, p2) {
		var x, y;
		if('x' in p1 && 'x' in p2)
		{
			x = p2.x - p1.x,
			y = p2.y - p1.y;
		}
		else
		{
			x = p2[0] - p1[0],
			y = p2[1] - p1[1];
		}
		
		return Math.sqrt(x*x + y*y);
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
	
	/* --debug-begin-- */
	$.log('base: ready');
	/* --debug-end-- */
//})(jQuery);