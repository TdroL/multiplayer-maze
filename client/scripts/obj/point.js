
obj.add('point', (function() {
	return {
		canvas: null,
		settings: {},
		points: {},
		colorSets: {
			prot: [
				['#ba0003', // ball
				 '#b20003', '#b30003', '#b40003', '#b60003', '#b80003',
				 '#bc0003', '#be0003', '#c00003', '#c10003', '#c20003'],
				['#006001',
				 '#005a01', '#005b01', '#005c01', '#005d01', '#005e01',
				 '#006201', '#006301', '#006401', '#006501', '#006601'],
				'#fff' // text color
			],
			deut: [
				['#fa5507',
				 '#f25507', '#f35507', '#f45507', '#f65507', '#f85507',
				 '#fb5507', '#fc5507', '#fd5507', '#fe5507', '#ff5507'],
				['#006c02',
				 '#006602', '#006702', '#006802', '#006a02', '#006b02',
				 '#006d02', '#006e02', '#006f02', '#007102', '#007202'],
				'#fff'
			],
			trit: [
				['#18f0df',
				 '#18f0cc', '#18f0ce', '#18f0d1', '#18f0d6', '#18f0d9',
				 '#18f0e3', '#18f0e6', '#18f0e8', '#18f0ea', '#18f0ef'],
				['#0dff35',
				 '#0dff0d', '#0dff11', '#0dff20', '#0dff27', '#0dff2c',
				 '#0dff3f', '#0dff4b', '#0dff52', '#0dff58', '#0dff5d'],
				'#000'
			]
		},
		colorClear: '#e5e5e5',
		useSet: null,
		playerSubset: 0,
		oponentSubset: 1,
		colors: null,
		queue: [],
		init: function(settings) {
			this.canvas = this.canvas || ui.screen.clone();
			this.settings = settings;
			
			this.status(true);
		},
		rollSet: function() {
			var sets = [];
			for (var i in this.colorSets)
			{
				sets.push(i);
			}
			
			return sets[Math.round(Math.random() * (sets.length - 1))];
		},
		dataReady: function(settings) {
			this.points = {};
			
			for (var i in settings.points)
			{
				for (var j in settings.points[i])
				{
					point = settings.points[i][j][0];
					value = settings.points[i][j][1];
					
					this.points[i] = this.points[i] || {};
					this.points[i][j] = {
						type: parseInt(point[0], 10),
						owner: parseInt(point[1], 10),
						val: parseInt(value, 10) || null
					};
				}
			}
		},
		start: function() {
			this.useSet = this.rollSet();
			this.colors = this.colorSets[this.useSet];
			
			if (Math.random() >= 0.5)
			{
				this.playerSubset = 0;
				this.oponentSubset = 1;
			}
			else
			{
				this.playerSubset = 1;
				this.oponentSubset = 0;
			}
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
			var points = this.points,
				point, value, t = pro.now(),
				player = obj.get('player'),
				set = this.colorSets[this.useSet],
				color;
			
			this.canvas.clearRect();
			
			var ct = 0;
			
			for (var i in points)
			{
				for (var j in points[i])
				{
					point = points[i][j];
					
					if (point.type === 2)
					{
						ct++;
						
						color = (player.pid == point.owner)
								? this.playerSubset
								: this.oponentSubset;
						
						this.drawPoint(j, i, set[color][point.val], point.val, set[2]);
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
			this.drawPoint(i, j, this.colorClear);
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