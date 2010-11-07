// declare states
state = {
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
		var timerID, interval = 5000,
			$ul,
			$schema = $('<li data-id="{#id}">'
						+'<div class="name">{#name}</div>'
						+'<div class="players">{#players}/{#limit}</div>'
						+'<a rel="join-channel" data-channel-id="{#id}">Dołącz</a>'
						+'</li>');
		
		this.update = function(data) {
			var channels = {},
				parsed = JSON.parse(data);
			
			$.each(parsed, function(i, v) {
				channels[v.id] = v;
			});
			
			$ul.find('li').each(function() {
				var $$ = $(this),
					id = $$.attr('id').substr(2);
				
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
				
				$li.attr('id', '__'+v.id)
					.find('.name').text(v.name).end()
					.find('.players').text(v.players+'/'+v.limit).end()
					.find('a[rel]').attr('rel', '__'+v.id);

				$ul.append($li);
			});
			
			delete data;
			delete channels;
			delete parsed;
		};
		
		this.init = function() {
			$ul = $ul || $('#servers ul').delegate('a', 'click', function() {
				var $$ = $(this),
					id = $$.attr('rel').substr(2);
				
				if(id)
				{
					net.bind('join-channel:'+id, true, function(data) {
						data = parseInt(data, 10);
						switch(data)
						{
							case 1:
							{
								player.in_channel = true;
								$('#container').switchTo('game');
								break;
							}
							case -2:
							{
								$.log('-2');
								ui.info('Brak wolnych miejsc', {'Ok': null});
								break;
							}
							case -1:
							{
								$.log('-1');
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
			net.unbind('get-channels');
			window.clearInterval(timerID);
		};
	},
	game: new function() {
		var canvas,
			data = [],
			timerID,
			settings = {
				maze: {
					width: null,
					height: null,
					outerWidth: null,
					outerHeight: null,
					block: 30, // blocks width and height; !! (width % block) = 0
					margin: 20,
					cols: 25,
					rows: 15,
					
					load: (function() {
						var loaded = false, callback = null;
						
						return function() {
							if( ! arguments.length)
							{
								loaded = true;
							}
							else if($.type(arguments[0]) === 'function')
							{
								callback = arguments[0];
							}
							
							if(loaded && $.type(callback) === 'function')
							{
								callback();
							}
						};
					})()
				}
			};
		
		$.getJSON('test.txt', function(response) {
			settings = $.extend(true, settings, response.settings);
			data = response.data;
			
			for(var i = 0; i < settings.maze.rows; i++)
			{
				if($.type(data[i]) !== 'array') data[i] = [];
				
				for(var j = 0; j < settings.maze.cols; j++)
				{					
					data[i][j] = [
						(i) ? data[i-1][j][2] : 1,
						(settings.maze.cols - j - 1) ? (data[i][j][0] || 0) : 1,
						(settings.maze.rows - i - 1) ? (data[i][j][1] || 0) : 1,
						(j) ? data[i][j-1][1] : 1
					];
				}
			}
			
			settings.maze.load();
			
			delete response;
		});
		
		this.init = function() {
			if(! window.debug && ! player.in_channel) // no hacking, please
			{
				$('#container').switchTo('servers');
				return;
			}
			
			canvas = $('#game canvas'); // all canvases
			
			
			net.action('update', function(data) {
				data = JSON.parse(data);			
				
				if('id' in data && data.id && data.id != net.id)
				{
					player.opponents[data.id] = player.opponents[data.id] || {x: 15, y: 15};
					player.opponents[data.id].x = data.x;
					player.opponents[data.id].y = data.y;
				}
				
				delete data;
			});
			
			net.action('quit', function(id) {
				if(id in player.opponents)
				{
					delete player.opponents[id];
				}
			});
			
			settings.maze.load(function() {
				settings.maze.width = settings.maze.cols * settings.maze.block;
				settings.maze.height = settings.maze.rows * settings.maze.block;
				
				settings.maze.outerWidth = settings.maze.width + 2*settings.maze.margin;
				settings.maze.outerHeight = settings.maze.height + 2*settings.maze.margin;
				
				canvas.attr({
						width: settings.maze.outerWidth,
						height: settings.maze.outerHeight
				});
				
				ui.maze(ui.canvas(canvas.filter('.maze')), settings.maze, data);
				ui.player(ui.canvas(canvas.filter('.players')), settings.maze, data);
				ui.text(ui.canvas(canvas.filter('.text')), settings.maze);
				
				phy.init(settings.maze, data);
				
				ui.loop(true);
				
				timerID = window.setInterval(function() {
					if(net.ws && net.ws.bufferedAmount == 0)
					{
						net._data.id = net.id;
						net._data.date = +new Date();
						net._data.x = Math.round2(player.ball.x);
						net._data.y = Math.round2(player.ball.y);
						
						net.send('update:'+JSON.stringify(net._data), false);
					}
				}, 20); // ms
			});
		};
		
		this.release = function() {
			ui.loop(false);
			player.in_channel = false;
			window.clearInterval(timerID);
		};
	}
};

// Konami Code!
var contra = new Audio('client/audios/contra.ogg'.url());
io.sequence(['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a', 'enter'], function() {
	contra.play();
});
io.bind(['escape'], function() {
	contra.pause();
	contra.currentTime = 0;
});

var docready = false;
// main
jQuery(function($) {
	if(docready)
	{
		return false; // 1.4.3 bug - http://bugs.jquery.com/ticket/7247
	}
	docready = true;
	
	$(window).bind('unload', function() {
		$.log('unbind');
		net.unbind('close');
	});
	
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
	}).delegate('a[rel^=switchTo-]', 'click', function() {
		$container.switchTo($(this).attr('rel').replace(/switchTo-(.+)$/i, '$1'));
		return false;
	});
	
	if(hash.length)
	{
		first =  $container.find(hash+'.tab');
	}
	
	$container.switchTo(first);
	
	$.log('main: ready');
});