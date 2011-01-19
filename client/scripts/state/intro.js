
state.add('intro', (function() {
	return {
		init: function() {
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
		},
		test: function() {
			return ('WebSocket' in window) && ( !! document.createElement('canvas').getContext);
		}
	};
})());