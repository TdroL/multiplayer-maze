	player = {
		canvas: null,
		settings: {},
		data: [],
		in_channel: false,
		ball: {
			x: 15,
			y: 15,
			px: 15, // previous x, y
			py: 15,
			f: 1500, // force
			fx: 0, // controll force
			fy: 0,
			fr: 0.1, // fraction
			m: 2, // mass
			r: 7  // radius
		},
		opponents: {},
		init: function(canvas, settings, data) {
			player.canvas = canvas;
			player.settings = settings;
			player.data = data;
			
			io.bind(['up'], {
				down: function() {
					player.ball.fy -= 1;
				},
				press: $.noop,
				up: function() {
					player.ball.fy += 1;
				}
			});
			
			io.bind(['down'], {
				down: function() {
					player.ball.fy += 1;
				},
				press: $.noop,
				up: function() {
					player.ball.fy -= 1;
				}
			});
			
			io.bind(['left'], {
				down: function() {
					player.ball.fx -= 1;
				},
				press: $.noop,
				up: function() {
					player.ball.fx += 1;
				}
			});
			
			io.bind(['right'], {
				down: function() {
					player.ball.fx += 1;
				},
				press: $.noop,
				up: function() {
					player.ball.fx -= 1;
				}
			});
		},
		update: function(dt) {
			var settings = this.settings,
				c = this.canvas,
				ball = this.ball;
			
			phy.move(ball, (dt * 0.001));

			c.clearRect(0, 0, settings.outerWidth, settings.outerHeight);
			
			c.lineWidth(1);
			
			$.each(this.opponents, function(i, v) {
				c.beginPath();
				c.fillStyle('#f00');
				c.arc(settings.margin + v.x, settings.margin + v.y, ball.r - 0.5, 0, Math.PI*2, true);
				c.fill().closePath();
			});
			
			c.beginPath();
			c.fillStyle('#00f');
			c.arc(settings.margin + ball.x, settings.margin + ball.y, ball.r - 0.5, 0, Math.PI*2, true);
			c.fill().closePath();
		}
	};