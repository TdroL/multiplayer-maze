//(function($) {

	// Konami Code!
	var contra = new Audio(net.url('audios/contra.ogg'));
	
	io.sequence(['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a', 'enter'], function() {
		contra.play();
	});
	io.bind('escape', function() {
		contra.pause();
		contra.currentTime = 0;
	});
	
	// main
	$(function() {
		
		var $container = $('#container'),
			first = $container.find(':first'),
			hash = window.location.hash;
		
		$container.switchInit({
			callback: {
				switchOut: function() {
					var st = state.get(this.id);
					
					st && st.release();
				},
				switchIn: function() {
					var st = state.get(this.id);
					
					st && st.init();
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
		
		['1', '2', '3', '4'].forEach(function(key, i) {
			io.bind(key, function() {
				$container.find('.tab:not(.hide)').find('a:eq('+i+')').click();
			});
		});
		
		io.bind('enter', function() {
			$container.find('.popup:not(.hide) p.links>a:first').click();
		});
		
		/* --debug-begin-- */
		io.log('main: ready');
		/* --debug-end-- */
	});
//})(jQuery);