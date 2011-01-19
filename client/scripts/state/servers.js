
state.add('servers', (function() {
	var timerID, interval = 2000,
		$ul,
		$schema = $('<li data-channel-id="{#id}">'
					+'<div class="name">{#name}</div>'
					+'<div class="players">{#players}/{#limit}</div>'
					+'<a data-channel-id="{#id}">Dołącz</a>'
					+'</li>');
	
	return {
		update: function(data) {
			var channels = {},
				parsed = JSON.parse(data);
			
			$.each(parsed, function(i, v) {
				channels[v.id] = v;
			});
			
			$ul.find('li').each(function() {
				var $$ = $(this),
					id = $$.data('channel-id');
				
				if (id in channels)
				{
					$$.find('.name').text(channels[id].name);
					$$.find('.players').text(channels[id].players+'/'+channels[id].limit);
					delete channels[id];
				}
				else
				{
					$$.remove();
				}
			});
			
			$.each(channels, function(i, v) {
				var $li = $schema.clone();
				
				$li.find('.name').text(v.name).end()
					.find('.players').text(v.players+'/'+v.limit).end()
					.find('a').andSelf().attr('data-channel-id', v.id);
	
				$ul.append($li);
			});
		},
		init: function() {
			$ul = $ul || $('#servers ul').delegate('a', 'click', function() {
				var $$ = $(this),
					player = obj.get('player'),
					id = $$.data('channel-id');
				
				if ( ! id)
				{
					return false;
				}
				
				net.bindOnce('join-channel:'+id, true, function(data) {
					data = JSON.parse(data);
					
					var status = parseInt(data[0], 10),
						pid = data[1] ? parseInt(data[1], 10) : null;
						
					switch(status)
					{
						case 1:
						{
							player.in_channel = true;
							player.pid = pid;
							player.channel_id = id;
							$('#container').switchTo('limbo');
							break;
						}
						case -3:
						{
							ui.info('Gra w toku', {'Ok': null});
							break;
						}
						case -2:
						{
							ui.info('Brak wolnych miejsc', {'Ok': null});
							break;
						}
						case -1:
						{
							ui.error('Taki kanał nie istnieje', {'Ok': null});
							break;
						}
					}
				});
				
				return false;
			});
			
			net.bindOnce('close', function() {
				ui.error('Utracono połączenie z serwerem', {
					'Połącz ponownie': function() {
						$('#container').switchTo('connect');
					}
				});
			});
			
			net.bind('get-channels', this.update);
			
			timerID = setInterval(function() {
				net.send('get-channels', false);
			}, interval);
		},
		release: function() {
			net.removeBind('get-channels');
			clearInterval(timerID);
		}
	};
})());