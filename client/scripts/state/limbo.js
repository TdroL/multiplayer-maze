
state.add('limbo', (function() {
	var ping = new Audio(net.url('audios/ping.ogg'));
	
	return {
		init: function() {
			var player = obj.get('player'),
				$limbo = $('#limbo'),
				$ul = $limbo.find('ul'),
				stopCountdown = false;
			
			id = $('#limbo').data('channel-id');
			
			$limbo.find('span.dots')/*.blink(false)*/.blink(400)
				.end().find('a[data-switch-to]').one('click.go-back', function() {
					net.send('leave-channel');
				})
				.end().find('.countdown').empty();
			
			$ul.find('.you')
				.removeClass('ready')
				.addClass('not-ready')
				.find('a[data-change-status]')
					.removeClass('unclickable')
					.click(function() {
						var status = $(this).data('change-status');
						
						$ul.find('.you').removeClass('ready not-ready')
										.addClass(status);
						
						net.send('change-status:'+status);
					});
			
			$ul.find('li').not('.you, .hide').remove();
			
			net.action('status-changed', function(data) {
				data = JSON.parse(data);
				
				$ul.find('.opponent[data-id='+data.id+']')
						.removeClass('ready not-ready')
						.addClass(data.status ? 'ready' : 'not-ready');
			});
			
			net.action('start-game', function(data) {
				data = JSON.parse(data);
				
				var count = 200, //5000, // 5 sec countdown
					step = 100,
					diff = pro.now() - data.time;
				
				count -= diff;
				
				var $counter = $limbo.find('.countdown').empty();
				
				$ul.find('a[data-change-status]').unbind('click').addClass('unclickable');
				
				window.setTimeout(function() {
					var time = Math.round2(count/1000),
						lastTime = Math.ceil(time);
					
					time = (/^\d+\.\d+$/.test(''+time)) ? time : time+'.0';
					
					count -= step;
					$counter.text(time);
					
					var id = window.setInterval(function() {
						
						if (stopCountdown)
						{
							stopCountdown = false;
							$limbo.find('.countdown').empty();
							window.clearInterval(id);
							return;
						}
						
						count -= step;
						
						if (count < 0)
						{
							window.clearInterval(id);
							
							$('#container').switchTo('game');
							
							return;
						}
						
						time = Math.round2(count/1000);
						
						if (lastTime > Math.ceil(time))
						{
							lastTime = Math.ceil(time);
							
							if (ping)
							{
								ping.currentTime = 0;
								ping.play();
							}
						}
						
						time = (/^\d+\.\d+$/.test(''+time)) ? time : time+'.0';
						
						$counter.text(time);
					}, step);
				}, step - diff);
				
			});
			
			net.action('quit', function(data) {
				$ul.find('.opponent[data-id='+data+']').remove();
				$ul.find('.waiting:last').after(
					$ul.find('.waiting:first').clone()
						.removeClass('hide')
				);
				
				var status = $('.you a[data-change-status]').data('change-status');
				net.send('change-status:'+status);
				
				stopCountdown = true;
			});
			
			net.action('joined-channel', function(data) {
				data = JSON.parse(data);
				
				if (data.id != net.id)
				{
					$ul.find('.waiting:last').remove();
					$ul.find('.opponent:last').after(
						$ul.find('.opponent:first').clone()
							.removeClass('hide')
							.addClass(data.status ? 'ready' : 'not-ready')
							.attr('data-id', data.id)
					);
				}
			});
			
			net.bindOnce('get-channel-info:'+player.channel_id, true, function(data) {
				data = JSON.parse(data);
				
				var players = data.players,
					$ul = $limbo.find('ul');
				
				for (var i = 0, c = (data.limit - data.count); i < c; i++)
				{
					$ul.find('.waiting:last').after(
						$ul.find('.waiting:first').clone().removeClass('hide')
					);
				}
				
				for (var i in players)
				{
					var el = players[i];
					
					if (el.id == net.id)
					{
						continue;
					}
					
					var $li = $ul.find('.opponent:first').clone();
					
					$li.attr('data-id', el.id);
					$li.removeClass('hide')
						.addClass(el.status ? 'ready' : 'not-ready');
					
					$ul.find('.opponent:last').after($li);
				}
			});
		},
		release: function() {
			$('#limbo span.dots').blink(false);
			
			net.removeAction('status-changed', 'start-game', 'quit', 'joined-channel');
		}
	};
})());