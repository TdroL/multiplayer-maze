
(function($) {
	player = {
		canvas: null,
		settings: {},
		data: [],
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
		init: function(canvas, settings, data) {
			player.canvas = canvas;
			player.settings = settings;
			player.data = data;
			
			io.bind(['up'], function(){
				player.ball.fy -= 1;
			}, function() {
				player.ball.fy += 1;
			});
			
			io.bind(['down'], function(){
				player.ball.fy += 1;
			}, function() {
				player.ball.fy -= 1;
			});
			
			io.bind(['left'], function(){
				player.ball.fx -= 1;
			}, function() {
				player.ball.fx += 1;
			});
			
			io.bind(['right'], function(){
				player.ball.fx += 1;
			}, function() {
				player.ball.fx -= 1;
			});
		
			io.bind(['add'], function() {
				player.ball.f += 100;
			});
			
			io.bind(['subtract'], function() {
				player.ball.f -= 100;
			});
		},
		update: function(dt) {
			var settings = this.settings,
				c = this.canvas;
			
			dt = (dt > ui.timer.target) ? ui.timer.target : dt;
			
			phy.move(this.ball, (dt * 0.001));
			
			c.clearRect(0, 0, settings.outerWidth, settings.outerHeight);
			
			c.fillStyle('#00f')
			 .lineWidth(1);
			
			c.beginPath();
			c.arc(settings.margin + this.ball.x + 1, settings.margin + this.ball.y + 1, this.ball.r, 0, Math.PI*2, true);
			c.fill();
		}
	};
})(jQuery);