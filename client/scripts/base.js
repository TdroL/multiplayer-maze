var pro, io, net, ui, phy, state, obj;

//(function($) {
	if ( ! ('console' in window))
	{
		window.console = { log: function() {}, error: function() {} };
	}
	
	if ( ! ('Audio' in window))
	{
		window.Audio = function() {
			this.play = $.noop;
			this.pause = $.noop;
			this.currentTime = 0;
		};
	}
	
	/* --debug-begin-- */
	window.debug = true;
	/* --debug-end-- */
	
	Array.prototype.empty = Array.prototype.empty || function() {
		this.splice(0, this.length);
		return this;
	};
	
	Array.prototype.merge = Array.prototype.merge || function(arr) {
		while (arr.length)
		{
			this.push(arr.shift());
		}
		return this;
	};
	
	// source: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
	Array.prototype.forEach = Array.prototype.forEach || function(fun /*, thisp */)
	{
		"use strict";
		
		if (this === void 0 || this === null)
			throw new TypeError();
		
		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== "function")
			throw new TypeError();
		
		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
		{
			if (i in t)
				fun.call(thisp, t[i], i, t);
		}
	};

	Math.sgn = Math.sgn || function(x) {
		if (x < 0) return -1;
		if (x > 0) return 1;
		return 0;
	};
	
	Math.round2 = Math.round2 || function(x, t) {
		t = t || 1;
		var pt = Math.pow(10, t);
		return Math.round(x*pt)/pt;
	};
	
	Math.dist = Math.dist || function(p1, p2) {
		var x, y;
		if ('x' in p1 && 'x' in p2)
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
	
	if ('WebSocket' in window)
	{
		WebSocket.prototype.on = WebSocket.prototype.on || function(event) {
			if ($.type(arguments[1]) === 'boolean' && ! arguments[1])
			{
				this['on'+event] = this['on'+event] || arguments[2];
			}
			else
			{
				this['on'+event] = arguments[1];
			}
		};
	}
//})(jQuery);