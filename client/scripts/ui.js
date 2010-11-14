(function($) {
	ui = {
		font: '11px "Trebutchet MS", Tahoma',
		maze: function(canvas, settings, data) {
			if( ! (canvas && settings))
			{
				return;
			}
			
			var c = canvas;			
			
			var dx = settings.margin,
				dy = settings.margin,
				d = settings.block,
				px, py;
			
			c.clearRect(0, 0, settings.outerWidth, settings.outerHeight);
			// clear and draw border
			c.strokeStyle('#000');
			c.fillStyle('#fff');
			c.lineWidth(1);
			c.fillRect(dx, dy, settings.width, settings.height);
			c.beginPath();
			
			for(var i = 0; i < settings.rows; i++)
			{
				for(var j = 0; j < settings.cols; j++)
				{					
					var cell = data[i][j];
					
					px = dx + d * j;
					py = dy + d * i;
					
					if(cell[0])
					{
						c.moveTo(px, py);
						c.lineTo(px + d, py);
					}
					if(cell[1])
					{
						c.moveTo(px + d, py);
						c.lineTo(px + d, py + d);
					}
					if(cell[2])
					{
						c.moveTo(px + d, py + d);
						c.lineTo(px, py + d);
					}
					if(cell[3])
					{
						c.moveTo(px, py + d);
						c.lineTo(px, py);
					}
				}
			}
			
			c.stroke();
		},
		player: function(canvas, settings, data) {
			player.init(canvas, settings, data);
			ui.list.push([player, player.update]);
		},
		text: function(canvas, settings) {
			text.init(canvas, settings);
			ui.list.push([text, text.update]);
		},
		point: function(canvas, settings) {
			point.init(canvas, settings);
			ui.list.push([point, point.update]);
		},
		// animation loop
		_running: false,
		list: [],
		timer: {
			last: 0,
			current: 0,
			delta: 0,
			target: 1000/40,
			min_sleep: 5
		},
		now: function() {
			var d = new Date(),
				t = d.getTime();
			delete d;
			return t;
		},
		loop: function() {
			var timer = ui.timer;
			
			if(arguments.length)
			{
				if( ! arguments[0])
				{
					ui._running = false;
					timer.last = 0;
					delete ui.list;
					ui.list = [];
					return;
				}
				
				if(ui._running === arguments[0])
				{
					// already running
					return;
				}
				
				ui._running = true;
				timer.last = ui.now();
				
				window.setTimeout(function() { ui.loop(); }, timer.min_sleep);
				return;
			}
			
			if( ! ui._running)
			{
				return;
			}
			
			timer.last = timer.last || ui.now();
			timer.current = ui.now();
			timer.delta = timer.current - timer.last;
			
			for(var i = 0, l = ui.list.length; i < l; i++)
			{
				var v = ui.list[i];
				v[1].call(v[0], timer.delta, timer.current);
			}
			
			timer.last = timer.current;
			timer.delta = timer.target - (ui.now() - timer.current);
			
			if(timer.delta > timer.min_sleep)
			{
				window.setTimeout(function() { ui.loop(); }, timer.delta);
			}
			else
			{
				window.setTimeout(function() { ui.loop(); }, timer.min_sleep);
			}
		},
		canvas: function(c) {
			// source: https://developer.mozilla.org/en/Code_snippets/Canvas
			if('jquery' in c)
			{
				c = c.get(0);
			}
			
			c !== null || $.error('ui.canvas - ', 'empty object', c);
			
			if ( ! (this instanceof ui.canvas))
			{
				return new ui.canvas(c);
			}
			
			this.context = c.getContext('2d');
			
			if( ! ui.canvas.prototype.arc)
			{
				var methods = ['arc','arcTo','beginPath','bezierCurveTo','clearRect','clip','closePath','drawFocusRing','drawImage','fill','fillRect','fillText','isPointInPath','lineTo','moveTo','putImageData','quadraticCurveTo','rect','restore','rotate','save','scale','setTransform','stroke','strokeRect','strokeText','transform','translate'];
				
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
				
				methods = ['createImageData','createLinearGradient','createRadialGradient','createPattern','getImageData','measureText'];
				
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
})(jQuery);