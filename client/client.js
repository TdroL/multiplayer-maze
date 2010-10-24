jQuery(function($) {
	var tab_switch_time = 500, // czas animacji
		$tabs = $('.tab').css('opacity', 0).addClass('hide');	
	
	var switchTo = function($tab)
	{
		var $siblings = $tab.siblings('.tab:visible'),
			showTab = function($tab) {
				$tab.removeClass('hide')
					.animate({'opacity': 1}, tab_switch_time);
			};
		
		if($siblings.length)
		{
			$siblings.animate({'opacity': 0}, tab_switch_time, function(){
				$(this).addClass('hide');
				showTab($tab);
			});
		}
		else
		{
			showTab($tab);
		}
	};
	
	$tabs.find('a[rel^=run-]').click(function() {
		var tab = $(this).attr('rel').replace(/run-(.+)$/i, '.$1');
		
		switchTo($tabs.filter(tab));
		
		return false;
	});
	
	switchTo($tabs.first());
});