(function($) {
	// switch states plugin
	$.fn.switchInit = function(options) {
		var settings = {
			switchTime: 500,
			switchOut: function($siblings, $tab) {
				var settings = this,
					callback = false;
				
				$siblings.stop(true, true)
					.animate({'opacity': 0}, settings.switchTime, function() {
						var id = this.id;
						
						$(this).addClass('hide');
						
						if(id in state && state[id].release)
						{
							state[id].release();
						}
						
						callback || settings.switchIn($siblings, $tab);
						callback = true;
					});
			},
			switchIn: function($siblings, $tab) {
				var settings = this,
					callback = false;
				
				$tab.stop(true, true)
					.removeClass('hide')
					.each(function() {
							var id = this.id;
							
							if(id in state && state[id].init)
							{
								state[id].init();
							}
					})
					.animate({'opacity': 1}, function() {
						callback || settings.switchTime;
						callback = true;
					});
			}
		};
		
		return this.each(function() {
				if(options)
				{
					$.extend(settings, options);
				}
				
				$(this).find('.tab')
						.css('opacity', 0)
						.addClass('hide')
						.data('switch-settings', settings);
		});
	};
	
	$.fn.switchTo = function(tab) {
		
		return this.each(function() {
			var $this = $(this),
				$tab = ($.type(tab) == 'string') ? $(this).find('#'+tab) : tab;
			
			if( ! ($tab.length && 'jquery' in $tab && $tab.is('.tab')))
			{
				$.error('switch - ', 'Unknown slide:', tab);
			}
			
			var $siblings = $tab.siblings('.tab:visible'),
				settings = $tab.data('switch-settings');
			
			$siblings.length ? settings.switchOut($siblings, $tab)
							 : settings.switchIn($siblings, $tab);
		});
	};
})(jQuery);