
state.add('connect', new function() {
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
});