
(function($) {
	ui = {
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
		
		// animation loop
		_running: false,
		_frames: -1,
		list: [],
		timer: {
			last: 0,
			current: 0,
			delta: 0,
			target: 1000/60,
			min_sleep: 5
		},
		loop: function() {
			var timer = this.timer;
			
			if( ! this._frames--)
			{
				return;
			}
			
			if(arguments.length)
			{
				if( ! arguments[0])
				{
					ui._running = false;
					return;
				}
				
				if(ui._running === arguments[0])
				{
					// already running
					return;
				}
				
				ui._running = true;
				timer.last = +new Date();
				
				window.setTimeout(function() { ui.loop(); }, timer.min_sleep);
				return;
			}
			
			if( ! ui._running)
			{
				return;
			}
			
			timer.current = +new Date();
			timer.delta = timer.current - timer.last;
			
			for(var i = 0, l = ui.list.length; i < l; i++)
			{
				var v = ui.list[i];
				v[1].call(v[0], timer.delta, timer.current);				
			}
			
			timer.last = timer.current;
			timer.delta = timer.target - (new Date() - timer.current);
			
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
				var methods = ['arc','arcTo','beginPath','bezierCurveTo','clearRect','clip','closePath','createImageData','createLinearGradient','createRadialGradient','createPattern','drawFocusRing','drawImage','fill','fillRect','fillText','getImageData','isPointInPath','lineTo','measureText','moveTo','putImageData','quadraticCurveTo','rect','restore','rotate','save','scale','setTransform','stroke','strokeRect','strokeText','transform','translate'];
				
				// drawFocusRing not currently supported
				for(var i = 0; i < methods.length; i++)
				{
					var m = methods[i];
					ui.canvas.prototype[m] = (function (m) {
						return function () {
							this.context[m].apply(this.context, arguments);
							return this;
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
		}
	};
})(jQuery);