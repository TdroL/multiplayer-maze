//(function($) {
	ui = {
		font: '10px "Trebuchet MS", Helvetica, Jamrul, sans-serif',
		screen: null,
		sizes: { width: 0, height: 0 },
		timer: {
			id: null,
			last: 0,
			current: 0,
			delta: 0,
			interval: 20, // 1000ms/50fps,
			running: false
		},
		init: function() {
			$(function() {
				ui.screen = ui.canvas($('#game canvas.screen'));
			});
		},
		start: function() {
			ui.stop();
			ui.timer.running = true;
			ui.loop();
		},
		stop: function() {
			clearTimeout(ui.timer.id);
			ui.timer.id = null;
			ui.timer.last = 0;
			ui.timer.running = false;
		},
		loop: function() {
			var timer = ui.timer, delay;
			
			timer.last = timer.last || pro.now();
			timer.current = pro.now();
			timer.delta = timer.current - timer.last;
			
			/* --debug-start-- */
			pro.start('update-each');
			/* --debug-end-- */
			
			obj.runEach('update', timer.delta, timer.current);
			
			/* --debug-start-- */
			pro.end('update-each');
			/* --debug-end-- */
			
			obj.runEach('render');
			
			/* --debug-start-- */
			pro.start('render-blit');
			/* --debug-end-- */
			
			ui.screen.clearRect();
			
			ui.screen.drawImage(obj.get('maze').canvas.c, 0, 0);
			ui.screen.drawImage(obj.get('point').canvas.c, 0, 0);
			ui.screen.drawImage(obj.get('player').canvas.c, 0, 0);
			ui.screen.drawImage(obj.get('text').canvas.c, 0, 0);
			
			/* --debug-start-- */
			pro.end('render-blit');
			/* --debug-end-- */
			
			timer.last = timer.current;
			
			if (ui.timer.running)
			{
				delay = ~~(ui.timer.interval - (pro.now() - timer.current));
				delay = (delay > 1) ? delay : 1;
				
				ui.timer.id = setTimeout(ui.loop, delay);
			}
		},
		canvas: function(c) {
			// source: https://developer.mozilla.org/en/Code_snippets/Canvas
			
			if (c && 'jquery' in c)
			{
				c = c.get(0);
			}
			
			if ( ! c)
			{
				io.error('ui.canvas - ', 'empty object', c);
			}
			
			if ( ! (this instanceof ui.canvas))
			{
				return new ui.canvas(c);
			}
			
			this.c = c;
			this.context = c.getContext('2d');
			
			if ( ! ui.canvas.prototype.arc)
			{
				ui.canvas.prototype.get = function() {
					return this.c;
				};
				
				// clone canvas
				ui.canvas.prototype.clone = function() {
					var nc = document.createElement('canvas');
					nc.width = this.c.width;
					nc.height = this.c.height;
					return ui.canvas(nc);
				};
				
				var methods = ['arc','arcTo','beginPath','bezierCurveTo',/*'clearRect',*/'clip','closePath','drawFocusRing','drawImage','fill','fillRect','fillText','lineTo','moveTo','putImageData','quadraticCurveTo','rect','restore','rotate','save','scale','setTransform','stroke','strokeRect','strokeText','transform','translate'];
				
				ui.canvas.prototype.clearRect = function() {
					if (arguments.length)
					{
						this.context.clearRect.apply(this.context, arguments);
					}
					else if(this.c.width && this.c.height)
					{
						this.context.clearRect(0, 0, this.c.width, this.c.height);
					}
					return this;
				};
				
				for (var i = 0; i < methods.length; i++)
				{
					var m = methods[i];
					ui.canvas.prototype[m] = (function (m) {
						return function () {
							/* --debug-begin-- */
							if (window.debug)
							{
								try
								{
									this.context[m].apply(this.context, arguments);
								}
								catch(e)
								{
									io.log('ui.canvas<method>: '+m+'('+[].slice.call(arguments)+') - '+e);
									return this;
								}
							}
							/* --debug-end-- */
							
							this.context[m].apply(this.context, arguments);
							
							return this;
						};
					})(m);
				}
				
				methods = ['createImageData','createLinearGradient','createRadialGradient','createPattern','getImageData','isPointInPath','measureText'];
				
				for (var i = 0; i < methods.length; i++)
				{
					var m = methods[i];
					ui.canvas.prototype[m] = (function (m) {
						return function () {
							/* --debug-begin-- */
							if (window.debug)
							{
								try
								{
									return this.context[m].apply(this.context, arguments);
								}
								catch(e)
								{
									io.log('ui.canvas<method>: '+m+'('+[].slice.call(arguments)+') - '+e);
									return null;
								}
							}
							/* --debug-end-- */
							
							return this.context[m].apply(this.context, arguments);
						};
					})(m);
				}
				
				var props = ['canvas','fillStyle','font','globalAlpha','globalCompositeOperation','lineCap','lineJoin','lineWidth','miterLimit','shadowOffsetX','shadowOffsetY','shadowBlur','shadowColor','strokeStyle','textAlign','textBaseline'];
				
				for (var i = 0; i < props.length; i++)
				{
					var p = props[i];
					ui.canvas.prototype[p] = (function (p) {
						return function (value) {
							/* --debug-begin-- */
							if (window.debug)
							{
								if ( ! (p in this.context))
								{
									io.log('ui.canvas<property>: '+p+': unknown property');
								}
							}
							/* --debug-end-- */
							
							if (typeof value === 'undefined')
							{
								return this.context[p];
							}
							this.context[p] = value;
							return this;
						};
					})(p);
				}
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
	
	ui.init();
	
	/* --debug-begin-- */
	io.log('ui: ready');
	/* --debug-end-- */
//})(jQuery);