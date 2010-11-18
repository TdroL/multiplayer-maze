(function($) {
	obj.add('text', {
		$$: null,
		canvas: null,
		settings: {},
		fps: 0,
		dt: 0,
		init: function(settings) {
			this.$$ = $('#game canvas.text');
			this.canvas = ui.canvas(this.$$);
			this.settings = settings;
			
			this.status(true);
		},
		update: function(dt) {
			this.fps = (Math.round(10000/dt)/10);
			this.dt = Math.round2(dt, 3);
		},
		render: function() {
			var settings = this.settings,
				c = this.canvas;
			
			c.clearRect(0, 0, settings.outerWidth, 50);
			c.font(ui.font);
			c.fillStyle('#000');
			c.fillText('fps: '+this.fps, settings.margin, 13);
			c.fillText('dt: '+this.dt, settings.margin + 60, 13);
		}
	});
})(jQuery);