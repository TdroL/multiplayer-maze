// based on https://github.com/botanicus/colours.js.git

var colors = {
	reset: "\x1B[0m",

	grey: "\x1B[0;30m",
	red: "\x1B[0;31m",
	green: "\x1B[0;32m",
	yellow: "\x1B[0;33m",
	blue: "\x1B[0;34m",
	magenta: "\x1B[0;35m",
	cyan: "\x1B[0;36m",
	white: "\x1B[0;37m",

	bold: {
		grey: "\x1B[1;30m",
		red: "\x1B[1;31m",
		green: "\x1B[1;32m",
		yellow: "\x1B[1;33m",
		blue: "\x1B[1;34m",
		magenta: "\x1B[1;35m",
		cyan: "\x1B[1;36m",
		white: "\x1B[1;37m",
	}
};

module.exports = {
	bold: {}
};

for(var i in colors)
{
	if( ! (colors.hasOwnProperty(i) && typeof colors[i] === 'string'))
	{
		continue;
	}
	
	module.exports[i] = (function(color) {
		return function(msg) {
			if( ! msg)
			{
				return colors.reset;
			}
			return color + msg + colors.reset;
		};
	})(colors[i]);
}

for(var i in colors.bold)
{
	if( ! (colors.bold.hasOwnProperty(i) && typeof colors.bold[i] === 'string'))
	{
		continue;
	}
	
	module.exports.bold[i] = (function(color) {
		return function(msg) {
			if( ! msg)
			{
				return colors.reset;
			}
			return color + msg + colors.reset;
		};
	})(colors.bold[i]);
}

