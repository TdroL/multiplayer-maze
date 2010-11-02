// declare states
state = {
	game: new function() {
		var canvas,
			data = [],
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
			canvas = $('#game canvas'); // all canvases
			
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
			});
		};
		
		this.release = function() {
			ui.loop(false);
		};
	}
};

// Konami Code!
var contra = new Audio('client/audios/contra.ogg'.url());
io.sequence(['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a', 'enter'], function() {
	contra.play();
});
io.sequence(['a', 'a', 'enter'], function() {
	contra.pause();
	contra.currentTime = 0;
});

// main
jQuery(function($) {
	var $container = $('#container'),
		first = $container.find('#intro');
	
	if(window.location.hash.length)
	{
		first =  $container.find(window.location.hash+'.tab');
	}
	
	$container.switchTo(first);
	
	$.log('main: ready');
});