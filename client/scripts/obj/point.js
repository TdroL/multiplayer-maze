(function($) {
	obj.add('point', {
		status: null,
		$$: null,
		canvas: null,
		settings: {},
		points: {},
		colors: ['#e5e5e5', '#3953A4', '#E52225', '#F6EB14', '#60BB46'],
		queue: [],
		init: function(settings) {
			this.$$ = $('#game canvas.points');
			this.canvas = ui.canvas(this.$$);
			this.settings = settings;
			
			var self = this;
			obj.ready(function() {
				self.drawPoints();
			});
			
			this.status(true);
		},
		update: function(dt) {
			var q;
			
			while(this.queue.length > 0)
			{
				q = this.queue.shift();
				this.clearPoint(q[0], q[1]);
				delete q;
			}
		},
		render: function() {
		
		},
		drawPoints: function() {
			var settings = this.settings,
				point, value, t = ui.now();
			
			this.canvas.clearRect(0, 0, settings.outerWidth, settings.outerHeight);
			
			for(var i = 0; i < settings.rows; i++)
			{
				for(var j = 0; j < settings.cols; j++)
				{
					this.clearPoint(j, i);
				}
			}
			
			for(var i in settings.points)
			{
				if(/^(\d+)$/.test(i))
				{
					for(var j in settings.points[i])
					{
						if(/^(\d+)$/.test(j))
						{
							point = settings.points[i][j][0];
							value = settings.points[i][j][1];
							
							this.points[i] = this.points[i] || {};
							this.points[i][j] = {
								type: parseInt(point[0], 10),
								owner: parseInt(point[1], 10),
								val: parseInt(value, 10) || null
							};
							
							point = this.points[i][j];
							
							if(point.type === 2)
							{
								this.drawPoint(j, i, this.colors[point.owner], point.val);
							}
						}
					}
				}
			}
			
			$.log('drawPoints time:', ui.now() - t);
		},
		drawPoint: function(ix, iy, color, num, num_color)
		{
			var settings = this.settings,
				c = this.canvas,
				metric,
				b = settings.block,
				bp = b * 0.1,
				bl = b * 0.6,
				x = settings.margin + ix*b + 0.1*b,
				xb = x + bp,
				xc = xb + bl,
				xbc = xc + bp,
				y = settings.margin + iy*b + 0.1*b,
				yb = y + bp,
				yc = yb + bl,
				ybc = yc + bp;
			
			c.clearRect(settings.margin + ix*b, settings.margin + iy*b, b, b);
			
			c.fillStyle(color);
			
			c.beginPath();
			
			c.moveTo(xb, y);
			c.lineTo(xc, y);
			
			c.arc(xc, yb, bp, Math.PI * 1.5, 0, false);
			
			c.lineTo(xbc, yc);
			
			c.arc(xc, yc, bp, 0, Math.PI * 0.5, false);
			
			c.lineTo(xb, ybc);
			
			c.arc(xb, yc, bp, Math.PI * 0.5, Math.PI, false);
			
			c.lineTo(x, yb);
			
			c.arc(xb, yb, bp, Math.PI, Math.PI * 1.5, false);
			
			c.closePath();
			c.fill();
			
			num = num || null;
			num_color = num_color || '#fff';
			
			if(num !== null)
			{
				c.font(ui.font);
				c.fillStyle(num_color);
				
				metric = c.measureText(num);
				
				c.fillText(num, settings.margin + ix*b + (b - metric.width)/2, settings.margin + iy*b + (b + Math.floor(parseInt(ui.font)*0.75))/2);
			}
		},
		clearPoint: function(i, j) {
			this.drawPoint(i, j, this.colors[0]);
		},
		_patterns:{},
		getPointPattern: function(color) {
			
			if(this._patterns[color])
			{
				return this._patterns[color];
			}
		}
	});
})(jQuery);