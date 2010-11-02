
(function($) {
	phy = {
		settings: {},
		data: [],
		init: function(settings, data) {
			this.settings = settings;
			this.data = data;
			
			Math.sgn = Math.sgn || function(x) {
				if(x < 0) return -1;
				if(x > 0) return 1;
				return 0;
			};
			
			Math.round2 = Math.round2 || function(x, t) {
				t = t || 1;
				var pt = Math.pow(10, t);
				return Math.round(x*pt)/pt;
			};
		},
		move: function(ball, dt) {
			var a, p, n, dtdt,
				fr = ball.fr;
			
			dtdt = dt * dt;
			
			a = ball.fx*ball.f/ball.m;
			n = (2 - fr)*ball.x - (1 - fr)*ball.px + a * dtdt;
			ball.px = ball.x;
			ball.x = n;
			
			a = ball.fy*ball.f/ball.m;
			n = (2 - fr)*ball.y - (1 - fr)*ball.py + a * dtdt;
			ball.py = ball.y;
			ball.y = n;
			
			this.interpolate(ball);
		},
		_collisions: {
					t: false,
					b: false,
					l: false,
					r: false,
					tl: false,
					tr: false,
					bl: false,
					br: false,
					xb: false, // block x
					yb: false, // block y
					ex: 0, // edge distance x
					ey: 0  // edge distance y
		},
		collision: function(ball) {
			var b, col, row, r, cell,
				x, y,
				ix, ix2r,
				iy, iy2r,
				collisions = this._collisions;
			
			collisions.t = false;
			collisions.b = false;
			collisions.l = false;
			collisions.r = false;
			collisions.tl = false;
			collisions.tr = false;
			collisions.bl = false;
			collisions.br = false;
			collisions.xb = false;
			collisions.yb = false;
			collisions.ex = 0;
			collisions.ey = 0;
			
			x = ball.x;
			y = ball.y;
			r = ball.r;
			rr = r*r;
			b = this.settings.block;
			
			col = Math.floor((x) / b);
			row = Math.floor((y) / b);
			
			if( ! (this.data[row] && this.data[row][col]))
			{
				return collisions;
			}
			
			cell = this.data[row][col];
			
			ix = b * col + r;
			iy = b * row + r;
			
			ix2r = ix + 2*r;
			iy2r = iy + 2*r;
			
			if(x < ix || x > ix2r || y < iy || y > iy2r)
			{
				collisions.l = (x < ix);
				collisions.r = (x > ix2r);
				collisions.t = (y < iy);
				collisions.b = (y > iy2r);
			}
			
			collisions.xb = !! ((cell[1] && collisions.r) || (cell[3] && collisions.l));
			collisions.yb = !! ((cell[0] && collisions.t) || (cell[2] && collisions.b));
			
			if(collisions.t && ! cell[0])
			{
				collisions.ey = iy - r - y;
				
				collisions.tl = !! (collisions.l && ! cell[3]  && 
					(Math.pow(ix - r - x, 2) + Math.pow(collisions.ey, 2) <= rr)
				);
				collisions.tr = !! (collisions.r && ! cell[1] &&
					(Math.pow(ix + 3*r - x, 2) + Math.pow(collisions.ey, 2) <= rr)
				);
				
				if(collisions.tl)
				{
					collisions.xb = 
					collisions.yb = !! (this.data[row-1][col][3] || this.data[row][col-1][0]);
					
					collisions.ex = ix - r - x;
				}
				
				if(collisions.tr)
				{
					collisions.xb = 
					collisions.yb = !! (this.data[row-1][col][1] || this.data[row][col+1][0]);
					
					collisions.ex = ix + 3*r - x;
				}
			}
			else if(collisions.b && ! cell[2])
			{
				collisions.ey = iy + 3*r - y;
				
				collisions.bl = (collisions.l && ! cell[3] && 
					(Math.pow(ix - r - x, 2) + Math.pow(collisions.ey, 2) <= rr)
				);
				collisions.br = (collisions.r && ! cell[1] && 
					(Math.pow(ix + 3*r - x, 2) + Math.pow(collisions.ey, 2) <= rr)
				);
				
				if(collisions.bl)
				{
					collisions.xb = 
					collisions.yb = !! (this.data[row+1][col][3] || this.data[row][col-1][2]);
				
					collisions.ex = ix - r - x;
				}
				
				if(collisions.br)
				{
					collisions.xb = 
					collisions.yb = !! (this.data[row+1][col][1] || this.data[row][col+1][2]);
				
					collisions.ex = ix + 3*r - x;
				}
			}
			
			return collisions;
		},
		interpolate: function(ball) {
			var dx = ball.x - ball.px, adx = Math.abs(dx), sgx = Math.sgn(dx),
				dy = ball.y - ball.py, ady = Math.abs(dy), sgy = Math.sgn(dy),
				i, sx, sy, s, ds, step = 0.4, step_2 = step/1.5,
				xb = false, yb = false, // blocks
				c; // collision
			
			if( ! (dx || dy)) return;
			
			if(adx > ady)
			{
				s = adx;
				while(s > step) s /= 2;
				ds = adx;
				sx = s * sgx;
				sy = (ady * s / adx) * sgy;
			}
			else
			{
				s = ady;
				while(s > step) s /= 2;
				ds = ady;
				sy = s * sgy;
				sx = (adx * s / ady) * sgx;
			}
			
			ball.x = ball.px;
			ball.y = ball.py;

			var px, py;
			
			for(i = 0; i < ds; i += s)
			{
				px = ball.x;
				py = ball.y;
				xb || (ball.x += sx);
				yb || (ball.y += sy);
				
				c = this.collision(ball);
				
				xb = xb || c.xb;
				yb = yb || c.yb;
				
				// corner fix - semi-magic
				if(c.tl)
				{
					if(ball.fx < 0 && ball.fy >= 0)
					{
						do
						{
							ball.py += (ball.fy ? step : step_2);
							ball.y += step;
							c = this.collision(ball);
						}
						while(c.br);
						
						xb = false;
						yb = false;
					}
					else if(ball.fx >= 0 && ball.fy < 0)
					{
						do
						{
							ball.px += (ball.fx ? step : step_2);
							ball.x += step;
							c = this.collision(ball);
						}
						while(c.br);
						
						xb = false;
						yb = false;
					}
					else if(ball.fx > 0 && ball.fy < 0)
					{
						if(c.ex < c.ey)
						{
							do
							{
								//ball.py -= step_2;
								ball.y += step;
								c = this.collision(ball);
							}
							while(c.br);
							
							xb = false;
							yb = false;
						}
						else if(c.ex > c.ey)
						{
							do
							{
								//ball.px -= step_2;
								ball.x += step;
								c = this.collision(ball);
							}
							while(c.br);
							
							xb = false;
							yb = false;
						}
						// if equal - block
					}
				}
				else if(c.tr)
				{
					if(ball.fx > 0 && ball.fy >= 0)
					{
						do
						{
							ball.py += (ball.fy ? step : step_2);
							ball.y += step;
							c = this.collision(ball);
						}
						while(c.br);
						
						xb = false;
						yb = false;
					}
					else if(ball.fx <= 0 && ball.fy < 0)
					{
						do
						{
							ball.px -= (ball.fx ? step : step_2);
							ball.x -= step;
							c = this.collision(ball);
						}
						while(c.br);
						
						xb = false;
						yb = false;
					}
					else if(ball.fx < 0 && ball.fy < 0)
					{
						if(c.ex < c.ey)
						{
							do
							{
								//ball.py -= step_2;
								ball.y += step;
								c = this.collision(ball);
							}
							while(c.br);
							
							xb = false;
							yb = false;
						}
						else if(c.ex > c.ey)
						{
							do
							{
								//ball.px -= step_2;
								ball.x -= step;
								c = this.collision(ball);
							}
							while(c.br);
							
							xb = false;
							yb = false;
						}
						// if equal - block
					}
				}
				else if(c.bl)
				{
					if(ball.fx < 0 && ball.fy <= 0)
					{
						do
						{
							ball.py -= (ball.fy ? step :step_2);
							ball.y -= step;
							c = this.collision(ball);
						}
						while(c.br);
						
						xb = false;
						yb = false;
					}
					else if(ball.fx >= 0 && ball.fy > 0)
					{
						do
						{
							ball.px += (ball.fx ? step : step_2);
							ball.x += step;
							c = this.collision(ball);
						}
						while(c.br);
						
						xb = false;
						yb = false;
					}
					else if(ball.fx < 0 && ball.fy > 0)
					{
						if(c.ex < c.ey)
						{
							do
							{
								//ball.py -= step_2;
								ball.y -= step;
								c = this.collision(ball);
							}
							while(c.br);
							
							xb = false;
							yb = false;
						}
						else if(c.ex > c.ey)
						{
							do
							{
								//ball.px -= step_2;
								ball.x += step;
								c = this.collision(ball);
							}
							while(c.br);
							
							xb = false;
							yb = false;
						}
						// if equal - block
					}
				}
				else if(c.br)
				{
					if(ball.fx > 0 && ball.fy <= 0)
					{
						do
						{
							ball.py -= (ball.fy ? step: step_2);
							ball.y -= step;
							c = this.collision(ball);
						}
						while(c.br);
						
						xb = false;
						yb = false;
					}
					else if(ball.fx <= 0 && ball.fy > 0)
					{
						do
						{
							ball.px -= (ball.fx ? step : step_2);
							ball.x -= step;
							c = this.collision(ball);
						}
						while(c.br);
						
						xb = false;
						yb = false;
					}
					else if(ball.fx > 0 && ball.fy > 0)
					{
						if(c.ex < c.ey)
						{
							do
							{
								//ball.py -= step_2;
								ball.y -= step;
								c = this.collision(ball);
							}
							while(c.br);
							
							xb = false;
							yb = false;
						}
						else if(c.ex > c.ey)
						{
							do
							{
								//ball.px -= step_2;
								ball.x -= step;
								c = this.collision(ball);
							}
							while(c.br);
							
							xb = false;
							yb = false;
						}
						// if equal - block
					}
				}
				
				
				if(xb)
				{
					ball.x = px;
					ball.px = ball.x;
				}
				
				if(yb)
				{
					ball.y = py;
					ball.py = ball.y;
				}
				
				if(xb && yb)
				{
					break;
				}
			}
		},
		debug: function() {
			$('.info').html(Array.prototype.splice.call(arguments, 0).join(' '));
		}
	};
	
	$.log('phy: ready');
})(jQuery);