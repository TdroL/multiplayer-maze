//(function($) {
	// declare states
	state = {
		intro: new function() {
			
			this.init = function() {
				var $div = $('#intro').find('>div').hide();
				
				$div.filter('.testing').hide();
				
				if(config.runTest())
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
				
				$('#container span.dots').blink(false).blink(400);
			};
			
			this.release = function() {
				$('#container span.dots').blink(false);
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
					
					if(id in channels)
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
					
					if(id)
					{
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
									$('#container').switchTo('game');
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
					}
					
					return false;
				});
				
				net.bind('close', true, false, function() {
					ui.error('Utracono połączenie z serwerem', {
						'Połącz ponownie': function() {
							$('#container').switchTo('connect');
						}
					});
				});
				
				net.bind('get-channels', this.update);
				
				timerID = window.setInterval(function() {
					net.send('get-channels', false);
				}, interval);
			};
			
			this.release = function() {
				net.removeBind('get-channels');
				window.clearInterval(timerID);
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
				if( ! window.debug)
				{
				/* --debug-end-- */
					if(! _player.in_channel)
					{
						$('#container').switchTo('servers');
					return;
					}
				/* --debug-begin-- */
				}
				/* --debug-end-- */
				
				canvas = $('#game canvas');
				
				net.action('update', function(data) {
					data = JSON.parse(data);			
					
					if(data.id && data.id !== _net.id)
					{
						_player.opponents[data.id] = _player.opponents[data.id] || {x: 15, y: 15};
						_player.opponents[data.id].pid = data.pid;
						_player.opponents[data.id].x = data.x;
						_player.opponents[data.id].y = data.y;
					}
				});
				
				net.action('clear', function(data) {
					_point.queue.push(JSON.parse(data));
				});
				
				net.action('quit', function(id) {
					if(id in _player.opponents)
					{
						delete _player.opponents[id];
					}
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
	var contra = new Audio('client/audios/contra.ogg'.url());
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
		if(docready)
		{
			/* --debug-begin-- */
			$.log('warning: double DOM load');
			/* --debug-end-- */
			return false; // 1.4.3 bug - http://bugs.jquery.com/ticket/7247
		}
		docready = true;
		
		/*
		$(window).bind('unload', function() {
			net.disconnect();
			net.removeBind('close');
		});
		*/
		
		var $container = $('#container'),
			first = $container.find('#intro'),
			hash = window.location.hash;
		
		$container.switchInit({
			callback: {
				switchOut: function() {
					var id = this.id;
					
					if(id in state && state[id].release)
					{
						state[id].release();
					}
				},
				switchIn: function() {
					var id = this.id;
					
					if(id in state && state[id].init)
					{
						state[id].init();
					}
				}
			}
		}).delegate('a[data-switch-to]', 'click', function() {
			$container.switchTo($(this).data('switch-to'));
			return false;
		});
		
		if(hash.length)
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