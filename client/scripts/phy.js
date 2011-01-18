//(function($) {
	phy = {
		settings: null,
		data: null,
		init: function(settings, data) {
			phy.settings = settings;
			phy.data = obj.get('maze').data;
		},
		move: function(ball, dt) {
			var vt = ball.vt * dt, fl;
			
			fl = Math.sqrt(ball.fx*ball.fx + ball.fy*ball.fy);
			vt = fl ? (vt/fl) : vt;
			
			ball.px = ball.x;
			ball.x += ball.fx*vt;
			
			ball.py = ball.y;
			ball.y += ball.fy*vt;
			
			phy.interpolate(ball);
		},
		_vec: {
			x: 0,
			y: 0,
			bx: false,
			by: false,
			reset: function() {
				this.x = 0;
				this.y = 0;
				this.bx = false;
				this.by = false;
			}
		},
		_sides: [
			{ vx:  0, vy:  1 },
			{ vx: -1, vy:  0 },
			{ vx:  0, vy: -1 },
			{ vx:  1, vy:  0 }
		],
		_corners: [{},{},{},{}],
		collision: function(ball) {
			var col, row,
				x, y, b, r, bp,
				cx, cy, cxw, cxh,
				vec = phy._vec,
				data = phy.data,
				cell, side, corner;
			
			x = ball.x;
			y = ball.y;
			b = phy.settings.block;
			r = ball.r;
			
			vec.reset();
			
			col = Math.floor(x / b);
			row = Math.floor(y / b);
			
			if ( ! (data[row] && data[row][col]))
			{
				return vec;
			}
			
			cell = data[row][col];
			
			cx = b * col;
			cy = b * row;
			cxw = cx + b;
			cyh = cy + b;
			
			side = phy._sides[0];
			side.d = (y-r) - cy;
			side.cell = cell[0];
			side.overlap = false;
			
			side = phy._sides[1];
			side.d = cxw - (x+r);
			side.cell = cell[1];
			side.overlap = false;
			
			side = phy._sides[2];
			side.d = cyh - (y+r);
			side.cell = cell[2];
			side.overlap = false;
			
			side = phy._sides[3];
			side.d = (x-r) - cx;
			side.cell = cell[3];
			side.overlap = false;
			
			
			for (var i in phy._sides)
			{
				side = phy._sides[i];
				
				if (side.d < 0)
				{
					side.overlap = true;
					
					if (side.cell)
					{
						vec.x -= side.vx*side.d;
						vec.y -= side.vy*side.d;
						
						vec.bx = vec.bx || (!! side.vx);
						vec.by = vec.by || (!! side.vy);
					}
				}
			}
			
			if (vec.x || vec.y)
			{
				return vec;
			}
			
			corner = phy._corners[0];
			corner.x = cx;
			corner.y = cy;
			corner.valid = phy._sides[0].overlap
						&& phy._sides[3].overlap
						&& (data[row-1][col][3] || data[row][col-1][0]);
			
			corner = phy._corners[1];
			corner.x = cxw;
			corner.y = cy;
			corner.valid = phy._sides[0].overlap
						&& phy._sides[1].overlap
						&& (data[row-1][col][1] || data[row][col+1][0]);
			
			corner = phy._corners[2];
			corner.x = cx;
			corner.y = cyh;
			corner.valid = phy._sides[2].overlap
						&& phy._sides[3].overlap
						&& (data[row+1][col][3] || data[row][col-1][2]);
			
			corner = phy._corners[3];
			corner.x = cxw;
			corner.y = cyh;
			corner.valid = phy._sides[1].overlap
						&& phy._sides[2].overlap
						&& (data[row+1][col][1] || data[row][col+1][2]);
			
			for (var i in phy._corners)
			{
				corner = phy._corners[i];
				if (corner.valid)
				{
					var d = Math.dist(ball, corner);
					
					if (d <= r)
					{
						var dd = d ? (r/d - 1) : r;
						
						vec.x -= dd * (corner.x - x);
						vec.y -= dd * (corner.y - y);
					}
				}
			}
			
			return vec;
		},
		interpolate: function(ball) {
			var dx = ball.x - ball.px, adx = Math.abs(dx), sgx = Math.sgn(dx),
				dy = ball.y - ball.py, ady = Math.abs(dy), sgy = Math.sgn(dy),
				i, sx, sy, s, ds, step = 1,
				bx = false, by = false, // blocks
				vec; // collision
			
			if ( ! (dx || dy)) return;
			
			if (adx > ady)
			{
				s = adx;
				while (s > step) s /= 2;
				ds = adx;
				sx = s * sgx;
				sy = (ady * s / adx) * sgy;
			}
			else
			{
				s = ady;
				while (s > step) s /= 2;
				ds = ady;
				sy = s * sgy;
				sx = (adx * s / ady) * sgx;
			}
			
			ball.x = ball.px;
			ball.y = ball.py;
			
			for (i = 0; i < ds; i += s)
			{
				bx || (ball.x += sx);
				by || (ball.y += sy);
				
				vec = phy.collision(ball);
				
				ball.x += vec.x;
				ball.y += vec.y;
				
				bx = bx || vec.bx;
				by = by || vec.by;
				
				if (bx && by)
				{
					return;
				}
			}
		}
	};
	
	/* --debug-begin-- */
	$.log('phy: ready');
	/* --debug-end-- */
//})(jQuery);