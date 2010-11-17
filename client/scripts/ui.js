(function($) {
	ui = {
		font: '11px "Trebutchet MS", Tahoma',
		timer: {
			id: null,
			last: 0,
			current: 0,
			delta: 0,
			interval: 1000/60 // 40 fps = 25ms
		},
		start: function() {
			ui.stop();
			ui.timer.id = window.setInterval(ui.loop, ui.timer.interval);
		},
		stop: function() {
			window.clearInterval(ui.timer.id);
			ui.timer.id = null;
			ui.timer.last = 0;
		},
		loop: function() {
			var timer = ui.timer;
			
			timer.last = timer.last || ui.now();
			timer.current = ui.now();
			timer.delta = timer.current - timer.last;
			
			obj.runEach('update', timer.delta, timer.current);
			obj.runEach('render');
			
			timer.last = timer.current;
		},
		// util
		now: function() {
			var d = new Date(),
				t = d.getTime();
			delete d;
			return t;
		},
		canvas: function(c) {
			// source: https://developer.mozilla.org/en/Code_snippets/Canvas
			if(c && 'jquery' in c)
			{
				c = c.get(0);
			}
			
			if( ! c)
			{
				$.error('ui.canvas - ', 'empty object', c);
			}
			
			if ( ! (this instanceof ui.canvas))
			{
				return new ui.canvas(c);
			}
			
			this.c = c;
			this.context = c.getContext('2d');
			
			this.get = (function(c) {
				return function() {
					return c;
				};
			})(c);
			
			if( ! ui.canvas.prototype.arc)
			{
				var methods = ['arc','arcTo','beginPath','bezierCurveTo','clearRect','clip','closePath','drawFocusRing','drawImage','fill','fillRect','fillText','lineTo','moveTo','putImageData','quadraticCurveTo','rect','restore','rotate','save','scale','setTransform','stroke','strokeRect','strokeText','transform','translate'];
				
				for(var i = 0; i < methods.length; i++)
				{
					var m = methods[i];
					ui.canvas.prototype[m] = (function (m) {
						return function () {
							if(window.debug)
							{
								try
								{
									this.context[m].apply(this.context, arguments);
									
								}
								catch(e)
								{
									$.log(m+': '+e);
								}
							}
							else
							{
								this.context[m].apply(this.context, arguments);
							}
							
							return this;
						};
					})(m);
				}
				
				delete methods;
				
				methods = ['createImageData','createLinearGradient','createRadialGradient','createPattern','getImageData','isPointInPath','measureText'];
				
				for(var i = 0; i < methods.length; i++)
				{
					var m = methods[i];
					ui.canvas.prototype[m] = (function (m) {
						return function () {
							if(window.debug)
							{
								try
								{
									return this.context[m].apply(this.context, arguments);
								}
								catch(e)
								{
									$.log(m+': '+e);
								}
							}
							else
							{
								return this.context[m].apply(this.context, arguments);
							}
						};
					})(m);
				}
				
				delete methods;
				
				var props = ['canvas','fillStyle','font','globalAlpha','globalCompositeOperation','lineCap','lineJoin','lineWidth','miterLimit','shadowOffsetX','shadowOffsetY','shadowBlur','shadowColor','strokeStyle','textAlign','textBaseline'];
				
				for(var i = 0; i < props.length; i++)
				{
					var p = props[i];
					ui.canvas.prototype[p] = (function (p) {
						return function (value) {
							if (typeof value === 'undefined')
							{
								return this.context[p];
							}
							this.context[p] = value;
							return this;
						};
					})(p);
				}
				
				delete props;
			}
		},
		// "infos" & "errors" popups
		_info: null,
		_error: null,
		info: function(text, callbacks) {
			ui._info = ui._info || $('#infos').delegate('.links a', 'click', function() {
				$('#infos').addClass('hide');
			});
			
			var $text = ui._info.find('p:first'),
				$links = ui._info.find('.links');
			
			$text.text(text);
			$links.empty();
			
			$.each(callbacks, function(i, fn) {
				$links.append($('<a>').text(i).click(fn || $.noop));
			});
			
			ui._info.removeClass('hide');
		},
		error: function(text, callbacks) {
			ui._error = ui._error || $('#errors').delegate('.links a', 'click', function() {
				$('#errors').addClass('hide');
			});
			
			var $text = ui._error.find('p:first'),
				$links = ui._error.find('.links');
			
			$text.text(text);
			$links.empty();
			
			$.each(callbacks, function(i, fn) {
				$links.append($('<a>').text(i).click(fn || $.noop));
			});
			
			ui._error
				.css('top', (480 - ui._error.outerHeight())/2)
				.removeClass('hide');
		}
	};
	
	$.log('ui: ready');
})(jQuery);