
	state = {
		list: {},
		add: function(name, o) {
			obj.remove(name);
			obj.list[name] = o;
			
			// add methods if not present
			o.init = o.init || $.noop;
			o.release = o.release || $.noop;
		},
		remove: function(name) {
			if (name in state.list)
			{
				delete state.list[name];
			}
		},
		get: function(name) {
			if (name in state.list)
			{
				return state.list[name];
			}
			return null;
		}
	};