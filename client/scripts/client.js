//(function($) {
	// declare states
	state = {
		intro: new function() {
			
			this.init = function() {
				var $div = $('#intro').find('>div').hide();
				
				$div.filter('.testing').hide();
				
				if (this.test())
				{
					$div.hide();
					$div.filter('.ready').show();
				}
				else
				{
					$div.hide();
					$div.filter('.fail').show();
				}
			};
			
			this.test = function() {
				return ('WebSocket' in window) && ( !! document.createElement('canvas').getContext);
			}
		},
		connect: new function() {
			var i = 0, interval = 400,
				timerID;
				
			this.init = function() {
				net.bind('open', true, false, function() {
					$('#container').switchTo('servers');
				});
				
				net.bind('close', true, false, function() {
					ui.error('Serwer nie odpowiada', {
						'Ponów próbę': function() {
							net.init();
						}
					});
				});
				
				net.init();
				
				$('#connect span.dots').blink(false).blink(400);
			};
			
			this.release = function() {
				$('#connect span.dots').blink(false);
			};
		},
		servers: new function() {
			var timerID, interval = 2000,
				$ul,
				$schema = $('<li data-channel-id="{#id}">'
							+'<div class="name">{#name}</div>'
							+'<div class="players">{#players}/{#limit}</div>'
							+'<a data-channel-id="{#id}">Dołącz</a>'
							+'</li>');
			
			this.update = function(data) {
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
			};
			
			this.init = function() {
				$ul = $ul || $('#servers ul').delegate('a', 'click', function() {
					var $$ = $(this),
						player = obj.get('player'),
						id = $$.data('channel-id');
					
					if ( ! id)
					{
						return false;
					}
					
					net.bind('join-channel:'+id, true, function(data) {
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
					
					return true;
				});
				
				net.bind('close', true, false, function() {
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
			};
			
			this.release = function() {
				net.removeBind('get-channels');
				clearInterval(timerID);
			};
		},
		limbo : new function() {
			
			var ping = new Audio(net.url('client/audios/ping.ogg'));
			
			this.init = function() {
				var player = obj.get('player'),
					$limbo = $('#limbo'),
					$ul = $limbo.find('ul'),
					stopCountdown = false;
				
				
				$limbo.find('span.dots').blink(false).blink(400);
				
				id = $('#limbo').data('channel-id');
				
				$limbo.find('a[data-switch-to]').one('click.go-back', function() {
						net.send('leave-channel');
					});
				
				$limbo.find('.countdown').empty();
				
				
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
				
				net.bind('get-channel-info:'+player.channel_id, true, true, function(data) {
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
			};
			
			this.release = function() {
				$('#limbo span.dots').blink(false);
				
				net.removeAction('status-changed', 'start-game', 'quit', 'joined-channel');
			};
		},
		game: new function() {
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
			
			this.init = function() {
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
			};
			
			this.release = function() {
				ui.stop();
				obj.clear();
				obj.runEach('stop');
			};
		}
	};
	
	// Konami Code!
	var contra = new Audio(net.url('client/audios/contra.ogg'));
	io.sequence(['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a', 'enter'], function() {
		contra.play();
	});
	io.bind('escape', function() {
		contra.pause();
		contra.currentTime = 0;
	});
	
	var docready = false;
	// main
	$(function() {
		if (docready)
		{
			/* --debug-begin-- */
			$.log('warning: double DOM load');
			/* --debug-end-- */
			return false; // 1.4.3 bug - http://bugs.jquery.com/ticket/7247
		}
		docready = true;
		
		var $container = $('#container'),
			first = $container.find(':first'),
			hash = window.location.hash;
		
		$container.switchInit({
			callback: {
				switchOut: function() {
					var id = this.id;
					
					if (id in state && state[id].release)
					{
						state[id].release();
					}
				},
				switchIn: function() {
					var id = this.id;
					
					if (id in state && state[id].init)
					{
						state[id].init();
					}
				}
			}
		}).delegate('a[data-switch-to]', 'click', function() {
			$container.switchTo($(this).data('switch-to'));
			return false;
		});
		
		if (hash.length)
		{
			first =  $container.find(hash+'.tab');
		}
		
		$container.switchTo(first);
		
		$.each(['1', '2', '3', '4'], function(i, key) {
			io.bind(key, function() {
				$container.find('.tab:not(.hide)').find('a:eq('+i+')').click();
			});
		});
		
		io.bind('enter', function() {
			$container.find('.popup:not(.hide) p.links>a').click();
		});
		
		/* --debug-begin-- */
		$.log('main: ready');
		/* --debug-end-- */
	});
//})(jQuery);