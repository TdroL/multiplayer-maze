var config,
	io,
	net, ws,
	ui,
	phy,
	state,
	player,
	point,
	text;

(function($){
	
	if(typeof console === "undefined")
	{
		console = { log: function() { }, error: function() { } };
	}
	
	window.debug = true;
	$.log = function() {
		window.debug && console.log.apply(console, arguments);
	};
	$.error = function() {
		window.debug && console.error.apply(console, arguments);
		throw arguments.join(' ');
	};
	
	config = {
		base_url: ''
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
	
	$.log('base: ready');
})(jQuery);

