
state.add('game', (function() {
	var canvas,
		data = [],
		timerID,
		settings = {
			width: null,
			height: null,
			outerWidth: null,
			outerHeight: null,
			block: 30,
			margin: 20,
			cols: 25,
			rows: 15,
			points: {}, // points (including start points)
			starts: {} // start points
		};
	
	return {
		init: function() {
			var _net = net,
				_point = obj.get('point'),
				_player = obj.get('player');
			
			/* --debug-begin-- */
			if ( ! window.debug)
			{
			/* --debug-end-- */
				if ( ! _player.in_channel)
				{
					$('#container').switchTo('servers');
					return;
				}
			/* --debug-begin-- */
			}
			/* --debug-end-- */
			
			net.action('update', function(data) {
				data = JSON.parse(data);
				
				if (data.id && data.id != _net.id)
				{
					_player.opponents[data.id] = _player.opponents[data.id] || {pid: 0, x: 15, y: 15};
					_player.opponents[data.id].pid = data.pid;
					_player.opponents[data.id].x = data.x;
					_player.opponents[data.id].y = data.y;
				}
			});
			
			net.action('clear', function(data) {
				_point.queue.push(JSON.parse(data));
			});
			
			net.action('quit', function(id) {
				if (id in _player.opponents)
				{
					delete _player.opponents[id];
				}
				
				ui.info('Jeden z graczy wyszedł', {'Ok': null});
				_net.send('leave-channel');
				
				$('#container').switchTo('servers');
			});
			
			obj.ready(function() {
				phy.init(settings);
				ui.start();
			});
			
			obj.runEach('init', settings);
		},
		release: function() {
			ui.stop();
			obj.clear();
			obj.runEach('stop');
		}
	};
})());