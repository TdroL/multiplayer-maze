//(function($) {
	
	pro = { // profiler
		/* --debug-begin-- */
		groups: {},
		stats: {
			time: 0,
			groups: null
		},
		init: function() {
			pro.stats.groups = pro.groups;
		},
		start: function(name) {
			var group = pro.get(name);
			group.start = pro.now();
		},
		end: function(name) {
			var group = pro.get(name);
			group.end = pro.now();
		},
		summarize: function() {
			var stats = pro.stats,
				group;
			
			stats.time = 0;
			
			for (var i in pro.groups)
			{
				group = pro.groups[i];
				
				if (group.end && group.start)
				{
					group.time = group.end - group.start;
					group.sum += group.time;
					group.runs++;
					
					group.end = group.start = group.part = 0;
					
					stats.time += group.time;
				}
			}
			
			if (pro.stats.time)
			{
				for (var i in pro.groups)
				{
					group = pro.groups[i];
					group.part = group.time/stats.time;
				}
			}
			
			return stats;
		},
		get: function(name) {
			pro.groups[name] = pro.groups[name] || {
				sum: 0,
				runs: 0,
				part: 0.0,
				time: 0,
				start: 0,
				end: 0
			};
			
			return pro.groups[name];
		},
		/* --debug-end-- */
		now: function() {
			return +new Date();
		}
	};
	
	/* --debug-begin-- */
	pro.init();
	/* --debug-end-- */
	
	/* --debug-begin-- */
	io.log('pro: ready');
	/* --debug-end-- */
//})(jQuery);