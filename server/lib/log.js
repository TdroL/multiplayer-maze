var sys = require('sys'),
	fs = require('fs')
	color = require('./color');

var log = {
	write_to_file: true,
	log_file: process.argv[1].replace(/\/[^\/]+$/i, '')+'/node.log',
	info: function() {
		if ( ! arguments.length)
		{
			return false;
		}
		
		var msg = Array.prototype.join.call(arguments, ' ').trim(),
			cons_msg = msg,
			file_msg = msg+'\r\n';
		
		if (arguments[0] !== null)
		{
			cons_msg = color.cyan(timestamp())+' - '+cons_msg;
			file_msg = timestamp()+' - '+file_msg;
		}
		
		console.log(cons_msg);	
		
		append_to_file(file_msg);
		
		return true;
	},
	error: function() {
		if ( ! arguments.length)
		{
			return false;
		}
		
		var msg = Array.prototype.join.call(arguments, ' ').trim(),
			cons_msg = msg,
			file_msg = msg+'\r\n';
		
		if (arguments[0] !== null)
		{
			cons_msg = color.red(timestamp())+' - '+color.red('ERROR:')+' '+cons_msg;
			file_msg = timestamp()+' - ERROR: '+file_msg+'\r\n';
		}
		else
		{
			cons_msg = color.red('ERROR:')+' '+cons_msg;
			file_msg = 'ERROR: '+file_msg+'\r\n';
		}
		
		console.log(cons_msg);	
		
		append_to_file(file_msg);
		
		return true;
	}
}

module.exports = log;

function append_to_file(msg) {
	if (log.write_to_file)
	{
		var fd = fs.openSync(log.log_file, 'a+');
		fs.writeSync(fd, msg, null);
		fs.closeSync(fd);
	}
}

// code from util
function pad (n) {
	return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

function timestamp () {
	var d = new Date();
	return	[
				[d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('.'),
				[pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':')
			].join(' ');
}