
state.add('connect', (function() {
	var i = 0, interval = 400,
		timerID;
		
	return {
		init: function() {
			net.bindOnce('open', function() {
				$('#container').switchTo('servers');
			});
			
			net.bindOnce('close', function() {
				ui.error('Serwer nie odpowiada', {
					'Ponów próbę': function() {
						net.init();
					}
				});
			});
			
			net.init();
			
			$('#connect span.dots').blink(false).blink(400);
		},
		release: function() {
			$('#connect span.dots').blink(false);
		}
	};
})());