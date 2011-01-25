
obj.add('text', (function() {
	return {
		canvas: null,
		settings: {},
		fps: 0,
		dt: 0,
		init: function(settings) {
			this.canvas = this.canvas || ui.screen.clone();
			this.settings = settings;
			
			this.status(true);
		},
		update: function(dt) {
			/* --debug-start-- */
			this.fps = Math.round(10000/dt)/10;
			this.dt = Math.round2(dt, 3);
			/* --debug-end-- */
		},
		render: function() {
			var settings = this.settings,
				c = this.canvas, h = 30,
				stats;
				
			/* --debug-start-- */
			pro.start('render-text');
			/* --debug-end-- */
			
			c.clearRect()
			 .font(ui.font)
			 .fillStyle('#000')
			 .fillText('fps: '+this.fps, settings.margin, 13);
			 
			return;
			/* --debug-start-- */
			c.fillText('dt: '+this.dt, settings.margin + 60, 13);
			
			pro.end('render-text');
			
			stats = pro.summarize();
			
			c.fillText('Overall time:', 500, h)
			 .fillText(stats.time, 580, h);
			
			for (var i in stats.groups)
			{
				h += 15;
				c.fillText(i+':', 500, h)
				 .fillText(stats.groups[i].time, 580, h)
				 .fillText(Math.round(stats.groups[i].part*100)+'%', 620, h);
			}
			/* --debug-end-- */
		}
	};
})());