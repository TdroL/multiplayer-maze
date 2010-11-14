(function($) {
	point = {
		canvas: null,
		settings: {},
		points: {},
		colors: ['#f5f5f5', '#3953A4', '#E52225', '#F6EB14', '#60BB46'],
		queue: [],
		init: function(canvas, settings) {
			this.canvas = canvas;
			this.settings = settings;
			
			canvas.clearRect(0, 0, settings.outerWidth, settings.outerHeight);
			
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
							var point = settings.points[i][j][0];
							
							this.points[i] = this.points[i] || {};
							this.points[i][j] = {
								type: parseInt(point[0], 10),
								owner: parseInt(point[1], 10),
								val: parseInt(settings.points[i][j][1], 10) || null
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
		},
		update: function(dt) {
			var q;
			
			while(point.queue.length > 0)
			{
				q = point.queue.shift();
				point.clearPoint(q[0], q[1]);
				delete q;
			}
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
		}
	}
})(jQuery);