(function($) {
	player = {
		pid: 1,
		canvas: null,
		settings: {},
		data: [],
		in_channel: false,
		ball: null,
		opponents: null,
		reset: function() {
			delete player.ball;
			delete player.opponents;
			
			player.ball = {
				x:  15,
				y:  15,
				px: 15, // previous x, y
				py: 15,
				fx: 0, // controll force
				fy: 0,
				vt: 120,
				r:  7  // radius
			};
			player.opponents = {};
		},
		init: function(canvas, settings, data) {
			player.reset();
			player.canvas = canvas;
			player.settings = settings;
			player.data = data;
			
			io.bind('up', {
				down: function() {
					player.ball.fy -= 1;
				},
				press: $.noop,
				up: function() {
					player.ball.fy += 1;
				}
			});
			
			io.bind('down', {
				down: function() {
					player.ball.fy += 1;
				},
				press: $.noop,
				up: function() {
					player.ball.fy -= 1;
				}
			});
			
			io.bind('left', {
				down: function() {
					player.ball.fx -= 1;
				},
				press: $.noop,
				up: function() {
					player.ball.fx += 1;
				}
			});
			
			io.bind('right', {
				down: function() {
					player.ball.fx += 1;
				},
				press: $.noop,
				up: function() {
					player.ball.fx -= 1;
				}
			});
			
			io.bind('space', {
				down: function() {
					player.capture();
				},
				press: $.noop
			});
		},
		_p: [],
		capture: function() {
			var settings = player.settings,
				ball = player.ball,
				p;
			
			player._p[0] = Math.floor(ball.x / settings.block);
			player._p[1] =  Math.floor(ball.y / settings.block);
			
			if(point.points[player._p[1]] && point.points[player._p[1]][player._p[0]])
			{
				p = point.points[player._p[1]][player._p[0]];
				
				if(p.owner === player.pid)
				{
					point.queue.push(player._p);
					net.send('clear:'+JSON.stringify(player._p));
				}
			}
			
		},
		update: function(dt) {
			var settings = player.settings,
				c = player.canvas,
				ball = player.ball;
			
			phy.move(ball, (dt * 0.001));

			c.clearRect(0, 0, settings.outerWidth, settings.outerHeight);
			
			c.lineWidth(1);
			
			$.each(player.opponents, function(i, v) {
				c.beginPath();
				c.fillStyle(point.colors[v.pid]);
				c.arc(settings.margin + v.x, settings.margin + v.y, ball.r - 0.5, 0, Math.PI*2, true);
				c.fill().closePath();
			});
			
			c.beginPath();
			c.fillStyle(point.colors[player.pid]);
			c.arc(settings.margin + ball.x, settings.margin + ball.y, ball.r - 0.5, 0, Math.PI*2, true);
			c.fill().closePath();
		}
	};
})(jQuery);