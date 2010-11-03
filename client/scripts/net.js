(function($) {
	net = {
		ws: null,
		id: 0,
		error: false,
		_data: {},
		init: function() {
			if( ! ('WebSocket' in window))
			{
				return;
			}
			
			this.ws = ws = new WebSocket('ws://'+(/^https?:\/\/([^\/]+)\//.exec(window.location)[1])+':8000');
			
			ws.on = function(event,  callback) {
				ws['on'+event] = callback;
			};
			
			ws.on('message', function(message) {
				var data = message.data, result;
				
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
			});
			
			ws.on('open', function() {
				window.setInterval(function() {
					if(ws.bufferedAmount == 0)
					{
						net._data.id = net.id;
						net._data.date = +new Date();
						net._data.x = Math.round2(player.ball.x);
						net._data.y = Math.round2(player.ball.y);
						
						ws.send('update:'+JSON.stringify(net._data));
					}
				}, 20); // ms
			});
		}
	};

	net.init();
	$.log('net: ready');
})(jQuery);