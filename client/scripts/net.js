(function($) {
	net = {
		host: '192.168.1.100:8000',
		connection: null,
		id: 0,
		error: false,
		init: function() {
			if( ! ('WebSocket' in window))
			{
				return;
			}
			
			ws = new WebSocket('ws://'+this.host);
			
			ws.onmessage = function(message) {
				var data = message.data, result;
				
				if((result = /^id:(\d+)$/.exec(data)))
				{
					net.id = parseInt(result[1], 10);
					return;
				}
				
				if((result = /^quit:(\d+)$/.exec(data)))
				{
					if(result[1] in player.opponents)
					{
						delete player.opponents[result[1]];
					}
					return;
				}
				
				if((result = /^update:(\{.+\})$/.exec(data)))
				{
					data = JSON.parse(result[1]);			
					
					if('id' in data && data.id && data.id != net.id)
					{
						player.opponents[data.id] = player.opponents[data.id] || {x: 15, y: 15};
						player.opponents[data.id].x = data.x;
						player.opponents[data.id].y = data.y;
					}
					return;
				}
			};
			
			window.setInterval(function() {
				ws.send('update:'+JSON.stringify({
					id: net.id,
					date: +new Date(),
					x: Math.round2(player.ball.x),
					y: Math.round2(player.ball.y)
				}));
			}, 20); // ms
		}
	};

	net.init();
	$.log('net: ready');
})(jQuery);