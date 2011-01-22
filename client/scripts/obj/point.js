
obj.add('point', (function() {
	return {
		canvas: null,
		settings: {},
		points: {},
		colors: ['#e5e5e5', '#3953A4', '#E52225', '#F6EB14', '#60BB46'],
		queue: [],
		init: function(settings) {
			this.canvas = ui.screen.clone();
			this.settings = settings;
			
			this.status(true);
		},
		dataReady: function() {
			this.drawPoints();
		},
		update: function(dt) {
			var q;
			/* --debug-start-- */
			pro.start('update-point');
			/* --debug-end-- */
			while (this.queue.length > 0)
			{
				q = this.queue.shift();
				this.clearPoint(q[0], q[1]);
			}
			/* --debug-start-- */
			pro.end('update-point');
			/* --debug-end-- */
		},
		drawPoints: function() {
			var settings = this.settings,
				point, value, t = pro.now();
			
			this.canvas.clearRect();
			
			/*
			for (var i = 0; i < settings.rows; i++)
			{
				for (var j = 0; j < settings.cols; j++)
				{
					this.clearPoint(j, i);
				}
			}
			*/
			
			for (var i in settings.points)
			{
				if (/^\d+$/.test(i))
				{
					for (var j in settings.points[i])
					{
						if (/^\d+$/.test(j))
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
							
							if (point.type === 2)
							{
								this.drawPoint(j, i, this.colors[point.owner], point.val);
							}
						}
					}
				}
			}
		},
		drawPoint: function(ix, iy, color, num, num_color)
		{
			var settings = this.settings,
				c = this.canvas,
				b = settings.block,
				m = settings.margin,
				metric;
			
			c.clearRect(m + ix*b, m + iy*b, b, b);
			
			c.drawImage(this.getPointCache(color), m + ix*b, m + iy*b);
			
			num = num || null;
			num_color = num_color || '#fff';
			
			if (num !== null)
			{
				metric = c.measureText(num);
				
				c.font(ui.font)
				 .fillStyle(num_color)
				 .fillText(num, m + ix*b + (b - metric.width)/2, m + iy*b + (b + Math.floor(parseInt(ui.font, 10)*0.75))/2);
			}
		},
		clearPoint: function(i, j) {
			this.drawPoint(i, j, this.colors[0]);
		},
		pointCache:{},
		getPointCache: function(color) {
			if (this.pointCache[color])
			{
				return this.pointCache[color];
			}
			
			var c, p,
				b = this.settings.block,
				bp = b * 0.1,
				bl = b * 0.6,
				x = bp,
				xb = x + bp,
				xc = xb + bl,
				xbc = xc + bp,
				y = bp,
				yb = y + bp,
				yc = yb + bl,
				ybc = yc + bp;
			
			p = this.pointCache[color] = document.createElement('canvas');
			p.width = p.height = b;
			c = ui.canvas(p);
			
			c.fillStyle(color)
			 .beginPath()
				.moveTo(xb, y)
				.lineTo(xc, y)
				.arc(xc, yb, bp, Math.PI * 1.5, 0, false)
				.lineTo(xbc, yc)
				.arc(xc, yc, bp, 0, Math.PI * 0.5, false)
				.lineTo(xb, ybc)
				.arc(xb, yc, bp, Math.PI * 0.5, Math.PI, false)
				.lineTo(x, yb)
				.arc(xb, yb, bp, Math.PI, Math.PI * 1.5, false)
			 .closePath()
			 .fill();
			
			return p;
		}
	};
})());
//})(jQuery);