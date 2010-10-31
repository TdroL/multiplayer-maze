
(function($) {
	player = {
		canvas: null,
		settings: {},
		data: [],
		ball: {
			x: 15,
			y: 15,
			fx: 0, // force
			fy: 0,
			dldl: 0,
			r: 7,
			speed: 120, // ax/sec
			a: function(dl, z, dzdl, dz) {
				return dl*z;
			}
		},
		i: 0,
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
		},
		update: function(dt) {
			var settings = player.settings,
				c = player.canvas,
				dl = (dt * 0.001) * player.ball.speed;
			
			player.ball.x += player.ball.a(dl, player.ball.fx, player.ball.dldl, player.ball.x);
			player.ball.y += player.ball.a(dl, player.ball.fy, player.ball.dldl, player.ball.y);

			player.ball.dldl = dl;

			c.clearRect(0, 0, settings.width + 2*player.settings.margin, settings.height + 2*player.settings.margin);
			
			c.fillStyle('#00f')
			 .lineWidth(1);

			c.beginPath();
			c.arc(player.settings.margin + player.ball.x, player.settings.margin + player.ball.y, player.ball.r, 0, Math.PI*2, true);
			c.fill();
		}
	};
})(jQuery);