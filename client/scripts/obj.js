(function($) {
	obj = {
		list: {},
		status: {},
		add: function(name, o) {
			obj.remove(name);
			obj.list[name] = o;
			obj.status[name] = false;
			
			o.status = (function(obj, name) {
				return function(flag) {
					obj.changeStatus(name, flag);
				};
			})(obj, name);
		},
		remove: function(name) {
			if(name in obj.list)
			{
				delete obj.list[name];
				delete obj.status[name];
			}
		},
		get: function(name) {
			if(name in obj.list)
			{
				return obj.list[name];
			}
			return null;
		},
		run: function(name, method, arg1, arg2, arg3, arg4) {
			var el;
			if((el = obj.get(name)))
			{
				if(method in el)
				{
					el[method].call(el, arg1, arg2, arg3, arg4);
				}
			}
		},
		runEach: function(method, arg1, arg2, arg3, arg4) {
			if( ! method || $.type(method) !== 'string')
			{
				return;
			}
			
			for(var i in obj.list)
			{
				var el = obj.list[i];
				if(method in el)
				{
					el[method].call(el, arg1, arg2, arg3, arg4);
				}
			}
		},
		readyCallback: [],
		ready: function(callback) {
			obj.readyCallback.push(callback);
		},
		clear: function() {
			while(obj.readyCallback.length)
			{
				delete obj.readyCallback.shift();
			}
		},
		changeStatus: function(name, flag) {
			var callback;
			obj.status[name] = !! flag;
			
			for(var i in obj.status)
			{
				if( ! obj.status[i])
				{
					return;
				}
			}
			
			while(obj.readyCallback.length)
			{
				callback = obj.readyCallback.shift();
				callback();
			}
		}
	};
	
	/* --debug-begin-- */
	$.log('obj: ready');
	/* --debug-end-- */
})(jQuery);