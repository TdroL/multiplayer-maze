//(function($) {
	// switch states plugin
	$.fn.switchInit = function(options) {
		var settings = {
			switchTime: 200,
			callback: {
				switchOut: $.noop,
				switchIn: $.noop
			},
			switchOut: function($siblings, $tab) {
				var settings = this,
					callback = false;
				
				$siblings.stop()
					.animate({'opacity': 0}, settings.switchTime)
					.queue(function() {
						$(this).dequeue().addClass('hide');
						
						settings.callback.switchOut.call(this);
						
						callback || settings.switchIn($siblings, $tab);
						callback = true;
					});
			},
			switchIn: function($siblings, $tab) {
				var settings = this;
				
				$tab.stop()
					.removeClass('hide')
					.each(function() {
						settings.callback.switchIn.call(this);
					})
					.animate({'opacity': 1}, settings.switchTime);
			}
		};
		
		return this.each(function() {
				if (options)
				{
					$.extend(settings, options);
				}
				
				$(this).find('.tab')
						.css('opacity', 0)
						.addClass('hide')
						.data('switch.settings', settings);
		});
	};
	
	$.fn.switchTo = function(tab) {
		return this.each(function() {
			var $this = $(this),
				$tab = ($.type(tab) == 'string') ? $this.find('#'+tab) : tab;
			
			if ( ! ($tab.length && 'jquery' in $tab && $tab.is('.tab')))
			{
				io.error('switch - ', 'Unknown slide:', tab);
			}
			
			var $siblings = $tab.siblings('.tab:not(.hide)'),
				settings = $tab.data('switch.settings');
			
			$siblings.length ? settings.switchOut($siblings, $tab)
							 : settings.switchIn($siblings, $tab);
		});
	};
	
	// blink effect
	$.fn.blink = function(interval) {
		interval = interval || false;
		return this.each(function() {
			var $this = $(this),
				timerID = $.data(this, 'blink.timerID');
			
			if (timerID)
			{
				clearInterval(timerID);
				$.removeData(this, 'blink.timerID');
				timerID = null;
			}
			
			if (interval === false)
			{
				return;
			}
			
			var letters = $this.text(),
				i, len = letters.length;
			
			letters = letters.split('');
			
			for (i in letters)
			{
				letters[i] = '<span>'+letters[i]+'</span>';
			}
			
			$this.empty().html(letters.join(''))
				.find('span').not(':eq(0)').css('visibility', 'hidden');
			
			i = 1;
			
			timerID = setInterval(function() {
				if (i < len)
				{
					$this.find('span:eq('+i+')').css('visibility', 'visible');
					i++;
				}
				else
				{
					$this.find('span').not(':eq(0)').css('visibility', 'hidden');
					i = 1;
				}
			}, interval);
			
			$.data(this, 'blink.timerID', timerID);
		});
	};
//})(jQuery);