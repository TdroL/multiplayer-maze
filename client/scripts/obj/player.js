//(function($) {
	obj.add('player', {
		pid: 1,
		$$: null,
		canvas: null,
		settings: {},
		data: [],
		point: null,
		ball: null,
		in_channel: false,
		opponents: null,
		init: function(settings) {
			var self = this,
				keys;
			
			self.reset();
			
			self.$$ = $('#game canvas.players')
			self.canvas = ui.canvas(self.$$);
			self.settings = settings;
			
			self.data = obj.get('maze').data;
			self.point = obj.get('point');
			
			keys = [
				{k: 'up',    a: 'y', m: -1},
				{k: 'down',  a: 'y', m: +1},
				{k: 'left',  a: 'x', m: -1},
				{k: 'right', a: 'x', m: +1}
			];
			
			$.each(keys, function(i, v) {
				io.bind(v.k, {
					down: function() {
						self.ball['f'+v.a] += v.m;
					},
					press: $.noop,
					up: function() {
						self.ball['f'+v.a] -= v.m;
					}
				});
			});
			
			io.bind('space', {
				down: function() {
					self.capture();
				},
				press: $.noop
			});
			
			self.status(true);
		},
		reset: function() {			
			this.ball = {
				x:  15,
				y:  15,
				px: 15, // previous x, y
				py: 15,
				fx: 0, // controll force
				fy: 0,
				vt: 120,
				r:  7  // radius
			};
			this.opponents = {};
		},
		_p: [],
		capture: function() {
			var settings = this.settings,
				ball = this.ball,
				point = this.point,
				_p = this._p, p;
			
			_p[0] = Math.floor(ball.x / settings.block);
			_p[1] =  Math.floor(ball.y / settings.block);
			
			if(point.points[_p[1]] && point.points[_p[1]][_p[0]])
			{
				p = point.points[_p[1]][_p[0]];
				
				if(p.owner === this.pid)
				{
					point.queue.push(_p);
					net.send('clear:'+JSON.stringify(_p));
				}
			}
			
		},
		update: function(dt) {
			/* --debug-start-- */
			pro.start('update-player');
			/* --debug-end-- */
			phy.move(this.ball, (dt * 0.001));
			/* --debug-start-- */
			pro.end('update-player');
			/* --debug-end-- */
		},
		render: function() {
			var settings = this.settings,
				point = this.point,
				ball = this.ball,
				c = this.canvas;
			
			c.clearRect(0, 0, settings.outerWidth, settings.outerHeight);
			c.lineWidth(1);
			
			/* --debug-start-- */
			pro.start('render-opps');
			/* --debug-end-- */
			$.each(this.opponents, function(i, v) {
				c.beginPath();
				c.fillStyle(point.colors[v.pid]);
				c.arc(settings.margin + v.x, settings.margin + v.y, ball.r - 0.5, 0, Math.PI*2, true);
				c.fill().closePath();
			});
			/* --debug-start-- */
			pro.end('render-opps');
			/* --debug-end-- */
			
			/* --debug-start-- */
			pro.start('render-ball');
			/* --debug-end-- */
			c.beginPath();
			c.fillStyle('#00f' || point.colors[self.pid]);
			c.arc(settings.margin + ball.x, settings.margin + ball.y, ball.r - 0.5, 0, Math.PI*2, true);
			c.fill().closePath();
			/* --debug-start-- */
			pro.end('render-ball');
			/* --debug-end-- */
		}
	});
//})(jQuery);