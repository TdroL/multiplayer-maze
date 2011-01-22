
obj.add('maze', (function() {
	return {
		canvas: null,
		settings: {},
		data: [],
		init: function(settings) {
			this.canvas = ui.screen.clone();
			this.settings = settings;
			
			this.loadData('test.txt');
		},
		loadData: function(url) {
			var self = this;
			
			$.getJSON(url, function(response) {
				var settings = self.settings,
					data = self.data,
					current, point;
				
				$.extend(true, self.settings, response.settings);
				
				settings.width = settings.cols * settings.block;
				settings.height = settings.rows * settings.block;
				
				settings.outerWidth = settings.width + 2*settings.margin;
				settings.outerHeight = settings.height + 2*settings.margin;
				
				self.data.empty().merge(response.data);
				
				for (var i = 0; i < settings.rows; i++)
				{
					if ($.type(data[i]) !== 'array') data[i] = [];
					
					for (var j = 0; j < settings.cols; j++)
					{
						current = data[i][j];
						if (current[2])
						{
							point = current[2];
							
							settings.points[i] = settings.points[i] || {};
							settings.points[i][j] = [point];
							
							switch(point[0])
							{
								case '1':
								{
									settings.starts[point[1]] = [i, j];
									break;
								}
								case '2':
								{
									settings.points[i][j][1] = current[3] || null;
									break;
								}
							}
						}
						
						data[i][j] = [
							(i) ? data[i-1][j][2] : 1,
							(settings.cols - j - 1) ? (current[0] || 0) : 1,
							(settings.rows - i - 1) ? (current[1] || 0) : 1,
							(j) ? data[i][j-1][1] : 1
						];
					}
				}
				
				obj.runEach('dataReady');
			});
		},
		dataReady: function() {
			this.drawMaze();
		},
		drawMaze: function() {
			var c = this.canvas,
				settings = this.settings,
				data = this.data,
				dx = settings.margin,
				dy = settings.margin,
				d = settings.block,
				px, py, cell, pp;
			
			c.clearRect();
			// clear and draw border
			c.strokeStyle('#000');
			c.fillStyle('#fff');
			c.lineWidth(1);
			c.fillRect(dx, dy, settings.width, settings.height);
			c.beginPath();
			
			for (var i = 0; i < settings.rows; i++)
			{
				for (var j = 0; j < settings.cols; j++)
				{
					cell = data[i][j];
					
					px = dx + d * j;
					py = dy + d * i;
					
					pp = [
						{x: px,     y: py}, 
						{x: px + d, y: py},
						{x: px + d, y: py + d},
						{x: px,     y: py + d}
					];
					
					for (var x = 0; x < 4; x++)
					{
						if (cell[x])
						{
							c.moveTo(pp[x].x, pp[x].y)
							 .lineTo(pp[((x < 3) ? (x+1) : 0)].x, pp[((x < 3) ? (x+1) : 0)].y);
						}
					}
				}
			}
			
			c.stroke();
			
			this.status(true);
		}
	};
	// update: function(dt) {},
	// render: function() {}
})());