var config,
	io,
	net,
	ui,
	state,
	player,
	point;

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
	
	$.log('base: ready');
})(jQuery);

