
(function($) {
	text = {
		canvas: null,
		settings: {},
		init: function(canvas, settings) {
			this.canvas = canvas;
			this.settings = settings;
		},
		update: function(dt, ct) {
			var settings = this.settings,
				c = this.canvas;			
			
			c.clearRect(0, 0, settings.outerWidth, settings.outerHeight);
			c.fillStyle('#000');
			c.fillText('FPS: '+(Math.round(10000/dt)/10), settings.margin, 13);
		}
	}
})(jQuery);