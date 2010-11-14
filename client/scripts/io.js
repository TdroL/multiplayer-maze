(function($) {
	io = {
		inited: false,
		binds: {}, binds_cache: {},
		sequences: {}, sequences_cache: {}, sequences_active: {},
		sequence_delay: 1000,
		key: { // acceptable keys
			8: 'backspace', 9: 'tab', 13: 'enter', 16: 'shift', 17: 'ctrl', 18: 'alt', 19: 'pause', 27: 'escape', 32: 'space', 33: 'page-up', 34: 'page-down', 35: 'end', 36: 'home', 37: 'left', 38: 'up', 39: 'right', 40: 'down', 45: 'insert', 46: 'delete', 48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9', 65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j', 75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z', 96: 'numpad-0', 97: 'numpad-1', 98: 'numpad-2', 99: 'numpad-3', 100: 'numpad-4', 101: 'numpad-5', 102: 'numpad-6', 103: 'numpad-7', 104: 'numpad-8', 105: 'numpad-9'
			// 112 - 123: f1 - f12
		},
		init: function() {
			$(window).keydown(function(event) {
				var code = event.keyCode || event.which;
				
				if(code in io.key && ! io.key[code].pressed)
				{
					io.key[code].pressed = true;
					
					io._runBind.call(event, 'down', code);
					io._runSequence.call(event, code);
				}
			}).keypress(function(event) {
				var code = event.keyCode || event.which;
				
				if(code in io.key)
				{
					io._runBind.call(event, 'press', code);
				}
			}).keyup(function(event) {
				var code = event.keyCode || event.which;
				
				if(code in io.key && io.key[code].pressed)
				{
					io.key[code].pressed = false;
					
					io._runBind.call(event, 'up', code);
				}
			});
			
			$.each(io.key, function(code, name) {
				io.key[code] = {
					//name: name,
					pressed: false,
					code: code
				};
				
				io.key[name] = io.key[code];
			});
		},
		pressed: function(keys) {
			/*
			 * Usage:
			 * if(io.pressed('up', 'down')) - if UP and DOWN keys are pressed
			 */
			for(var i = 0; i < arguments.length; i++)
			{
				if( ! io.key[arguments[i]] || ! io.key[arguments[i]].pressed)
				{
					return false;
				}
			}
			
			return true;
		},
		bind: function(keys, callbacks) {
			if( ! $.isArray(keys))
			{
				keys = keys ? [keys] : [];
			}
			
			if($.isFunction(callbacks))
			{
				callbacks = { press: callbacks };
			}
			
			if( ! keys.length)
			{
				$.error('io.bind - ', 'No keys to map');
			}
			
			var list = io._parseKeys(keys);
			
			if( ! list.length)
			{
				$.error('io.bind - ', 'No valid keys to map');
			}
			
			list.sort(function(a, b) {
				return a - b;
			});

			var id = list.join(',');
			
			if(id in io.binds)
			{
				delete io.binds[id];
			}
			
			io.binds[id] = {
				list: list,
				status: false,
				down: callbacks.down,
				press: callbacks.press,
				up: callbacks.up
			};
			
			$.each(list, function(i, v) {
				io.binds_cache[v] = io.binds_cache[v] || {};
				io.binds_cache[v][id] = io.binds[id];
			});
		},
		sequence: function(keys, fn, delay) {
			if( ! ($.isArray(keys) && keys.length))
			{
				$.error('io.sequence - ', 'first param is not an array or is empty', keys);
			}
			if( ! $.isFunction(fn))
			{
				$.error('io.sequence - ', 'second param is not a function', fn);
			}
			
			delay = parseInt(delay || io.sequence_delay, 10);
			
			var list = io._parseKeys(keys);
			
			var id = list.join(',');
			
			if(id in io.sequences)
			{
				delete io.sequences[id];
			}
			
			io.sequences[id] = {
				list: list,
				index: 0,
				status: false,
				delay: delay,
				fn: fn
			};
			
			var v = list[0];
			io.sequences_cache[v] = io.sequences_cache[v] || {};
			io.sequences_cache[v][id] = io.sequences[id];
		},
		_runBind: function(method, key) {
			var event = this;
			event.preventDefault = event.preventDefault || $.noop;
			
			if(key in io.binds_cache)
			{
				switch(method)
				{
					case 'down':
					{
						$.each(io.binds_cache[key], function(i, v) {
							if(io.pressed.apply(io, v.list) && $.isFunction(v.down))
							{
								event.preventDefault();
								v.status = true;
								v.down();
							}
						});
						break;
					}
					case 'press':
					{
						$.each(io.binds_cache[key], function(i, v) {
							if(io.pressed.apply(io, v.list) && $.isFunction(v.press))
							{
								event.preventDefault();
								v.press();
							}
						});
						break;
					}
					case 'up':
					{
						$.each(io.binds_cache[key], function(i, v) {
							if(v.status && $.isFunction(v.up))
							{
								event.preventDefault();
								v.up();
								v.status = false;
							}
						});
						break;
					}
				}
			}
		},
		_runSequence: function(key) {
			var event = this;
			event.preventDefault = event.preventDefault || $.noop;
			
			$.each(io.sequences_active, function(i, v) {
				v(key);
			});
			
			if(key in io.sequences_cache)
			{
				function release(i, v) {
					v.index = 0;
					delete io.sequences_active[i];
				};
				
				$.each(io.sequences_cache[key], function(i, v) {
					if( ! (i in io.sequences_active))
					{
						v.index = 1; // skip first key - it's valid
						
						io.sequences_active[i] = (function(i, v) {
							var timer;
							
							return function(key) {
									window.clearTimeout(timer);
									
									if(v.list[v.index] != key)
									{
										release(i, v);
										return;
									}
									
									v.index++;
									
									if(v.index == v.list.length)
									{
										v.fn();
										release(i, v);
										return;
									}
									
									timer = window.setTimeout(function() {
										release(i, v);
									}, v.delay);
							};
						})(i, v);
					}
				});
				
				event.preventDefault();
			}
		},
		_parseKeys: function(keys) {
			var list = [];
			$.each(keys, function(i, k) {
				if(k in io.key)
				{
					list.push(parseInt(io.key[k].code, 10));
					return;
				}
				$.error('io.bind - ', 'Unknown key:', k);
				/*
				switch($.type(k))
				{
					case 'string':
					{
						if(k in io.key)
						{
							list.push(parseInt(io.key[k].code, 10));
							break;
						}
						$.error('io.bind - ', 'Unknown key:', k);
					}
					case 'object':
					{
						if('code' in k)
						{
							list.push(parseInt(k, 10));
							break;
						}
						$.error('io.bind - ', 'Unknown key:', k);
					}
					case 'number':
					{
						list.push(k);
						break;
					}
				}
				*/
			});
			
			return list;
		}
	};
	
	io.init();
	
	$.log('io: ready');
})(jQuery);