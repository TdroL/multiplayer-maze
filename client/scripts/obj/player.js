
obj.add('player', (function() {
	var lastPos = {x: 0, y: 0},
		rangeColor = [3, 10], // error range
		rangeOrder = [3, 7];
	
	return {
		id: 0,
		pid: 1,
		canvas: null,
		settings: {},
		data: [],
		point: null,
		ball: null,
		inChannel: false,
		channelId: null,
		opponents: {},
		errors: {
			order: 0,
			colors: 0
		},
		currentBlock: 0,
		blocksCount: 0,
		init: function(settings) {
			var self = this,
				keys;
			
			this.reset();
			
			this.canvas = this.canvas || ui.screen.clone();
			this.settings = settings;
			
			this.data = obj.get('maze').data;
			this.point = obj.get('point');
			
			keys = [
				{k: 'up',    a: 'y', m: -1},
				{k: 'down',  a: 'y', m: +1},
				{k: 'left',  a: 'x', m: -1},
				{k: 'right', a: 'x', m: +1}
			];
			
			keys.forEach(function(v) {
				io.bind(v.k, {
					down: function() {
						self.ball['f'+v.a] += v.m;
					},
					press: $.noop,
					up: function() {
						self.ball['f'+v.a] -= v.m;
					}
				});
			});
			
			io.bind('space', {
				down: function() {
					self.capture();
				},
				press: $.noop
			});
			
			this.analyseMaze();
			
			this.status(true);
		},
		analyseMaze: function() {
			var points = obj.get('point'),
				s = this.settings,
				b = this.ball;
			
			for (var i in points.points)
			{
				for (var j in points.points[i])
				{
					var point = points.points[i][j];
					if (point.type == 1 && this.pid == point.owner)
					{
						b.x = b.px = s.block * parseInt(j, 10) + s.margin - b.r/2;
						b.y = b.py = s.block * parseInt(i, 10) + s.margin - b.r/2;
					}
					else if (point.type == 2 && this.pid == point.owner)
					{
						this.blocksCount++;
					}
				}
			}
		},
		reset: function() {			
			this.ball = {
				x:  15,
				y:  15,
				px: 15, // previous x, y
				py: 15,
				fx: 0, // controll force
				fy: 0,
				vt: 120,
				r:  7  // radius
			};
			this.opponents = {};
			
			this.errors.order = this.errors.colors = 0;
			this.currentBlock = 0;
			this.blocksCount = 0;
		},
		_p: [],
		capture: function() {
			var settings = this.settings,
				ball = this.ball,
				point = this.point,
				_p = this._p, p;
			
			_p[0] = Math.floor(ball.x / settings.block);
			_p[1] =  Math.floor(ball.y / settings.block);
			
			if (point.points[_p[1]] && point.points[_p[1]][_p[0]])
			{
				p = point.points[_p[1]][_p[0]];
				
				if (p.owner === this.pid)
				{
					if ((this.currentBlock + 1) == p.val)
					{
						point.queue.push(_p);
						net.send('clear:'+JSON.stringify(_p));
						this.currentBlock = p.val;
						
						if (this.blocksCount == this.currentBlock)
						{
							net.send('finished:'+this.pid); // don't hack, please :)
							net.send('silent-leave-channel');
							this.finished(true);
						}
					}
					else
					{
						if (Math.dist(lastPos, ball) >= settings.block/2)
						{
							this.errors.order++;
							lastPos.x = ball.x;
							lastPos.y = ball.y;
						}
					}
				}
				else
				{
					if (Math.dist(lastPos, ball) >= settings.block/2)
					{
						this.errors.colors++;
						
						if (p.val && (this.currentBlock + 1) == p.val)
						{
							this.errors.order++;
						}
						
						lastPos.x = ball.x;
						lastPos.y = ball.y;
					}
				}
			}
			
		},
		finished: function(won, pid) {
			var self = this;
			
			if (won)
			{
				if (self.errors.colors >= rangeColor[0] && self.errors.colors <= rangeColor[1])
				{
					ui.info('Wygrałeś! Przejdź dalej zobaczyć komunikat.', {
						'Dalej': function() {
							var $a = $('#info-colorblind').find('a[href]'),
								href = $a.attr('href');
							
							href = href.replace(/^([^\?]+).*$/, '$1?flaw='+obj.get('point').useSet+'&value='+self.errors.colors);
							$a.attr('href', href);
							
							io.log(href);
							
							$('#container').switchTo('info-colorblind');
						}
					});
				}
				else if(self.errors.order >= rangeOrder[0] && self.errors.order <= rangeOrder[1])
				{
					ui.info('Wygrałeś! Przejdź dalej zobaczyć komunikat.', {
						'Dalej': function() {
							var $a = $('#info-myopia').find('a[href]'),
								href = $a.attr('href');
							
							href = href.replace(/^([^\?]+).*$/, '$1?flaw=myopia&value='+self.errors.order);
							$a.attr('href', href);
							
							io.log(href);
							
							$('#container').switchTo('info-myopia');
						}
					});
				}
				else
				{
					ui.info('Wygrałeś!', {
						'Wróć do listy serwerów': function() {
							$('#container').switchTo('servers');
						}
					});
				}
			}
			else
			{
				if (self.errors.colors >= rangeColor[0] && self.errors.colors <= rangeColor[1])
				{
					ui.info('Gracz '+pid+' wygrał! Przejdź dalej zobaczyć komunikat.', {
						'Dalej': function() {
							net.send('silent-leave-channel');
							
							var $a = $('#info-colorblind').find('a[href]'),
								href = $a.attr('href');
							
							href = href.replace(/^([^\?]+).*$/, '$1?flaw='+obj.get('point').useSet+'&value='+self.errors.colors);
							$a.attr('href', href);
							
							io.log(href);
							
							$('#container').switchTo('info-colorblind');
						}
					});
				}
				else if(self.errors.order >= rangeOrder[0] && self.errors.order <= rangeOrder[1])
				{
					ui.info('Gracz '+pid+' wygrał! Przejdź dalej zobaczyć komunikat.', {
						'Dalej': function() {
							net.send('silent-leave-channel');
							
							var $a = $('#info-myopia').find('a[href]'),
								href = $a.attr('href');
							
							href = href.replace(/^([^\?]+).*$/, '$1?flaw=myopia&value='+self.errors.order);
							$a.attr('href', href);
							
							io.log(href);
							
							$('#container').switchTo('info-myopia');
						}
					});
				}
				else
				{
					ui.info('Gracz '+pid+' wygrał!', {
						'Wróć do listy serwerów': function() {
							net.send('silent-leave-channel');
							
							$('#container').switchTo('servers');
						}
					});
				}
			}
		},
		update: function(dt) {
			/* --debug-start-- */
			pro.start('update-player');
			/* --debug-end-- */
			
			phy.move(this.ball, (dt * 0.001));
			
			/* --debug-start-- */
			pro.end('update-player');
			/* --debug-end-- */
		},
		render: function() {
			var settings = this.settings,
				point = this.point,
				ball = this.ball,
				c = this.canvas, 
				set = point.colorSets[point.useSet];
			
			c.clearRect()
			 .lineWidth(1)
			 .strokeStyle('#000');
			
			/* --debug-start-- */
			pro.start('render-opps');
			/* --debug-end-- */
			
			$.each(this.opponents, function(i, v) {
				var m = settings.margin,
					r = ball.r;
				
				c.beginPath()
					.fillStyle(set[point.oponentSubset][0])
					.arc(m + v.x, m + v.y, r, 0, Math.PI*2, true)
					.fill()
					.stroke()
				.closePath();
				
				// pid
				var metric = c.measureText(v.pid);
				
				c.font(ui.font)
				 .fillStyle(set[2])
				 .fillText(v.pid, m + v.x - metric.width/2, m + v.y + parseInt(ui.font, 10)*0.35);
			});
			/* --debug-start-- */
			pro.end('render-opps');
			/* --debug-end-- */
			
			/* --debug-start-- */
			pro.start('render-ball');
			/* --debug-end-- */
			c.beginPath()
				.fillStyle(set[point.playerSubset][0])
				.arc(settings.margin + ball.x, settings.margin + ball.y, ball.r - 0.5, 0, Math.PI*2, true)
				.fill()
				.stroke()
			.closePath();
			/* --debug-start-- */
			pro.end('render-ball');
			/* --debug-end-- */
		}
	};
})());