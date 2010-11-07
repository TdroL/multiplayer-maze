var config,
	io,
	net, ws,
	ui,
	phy, vec,
	state,
	player,
	point,
	text;
	
	if(typeof console === "undefined")
	{
		console = { log: function() { }, error: function() { } };
	}
	
	window.debug = true;
	$.log = function() {
		window.debug && console.log.apply(console, arguments);
	};
	$.error = function() {
		window.debug && console.error.apply(console, arguments) && alert('Error: '+arguments.join(' '));
		throw arguments.join(' ');
	};
	
	config = {
		base_url: '/multiplayer/'
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
	
	$.log('base: ready');