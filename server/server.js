var sys = require("sys"),
	ws = require('./lib/ws');

var server = ws.createServer();

server.addListener("listening", function() {
	sys.log("Listening for connections.");
});

var players = {};

// Handle WebSocket Requests
server.addListener("connection", function(conn) {
	sys.log("<"+conn.id+"> connected");
	conn.send('id:'+conn.id);
	
	conn.addListener("message", function(message) {
		server.broadcast(message);
	});
});

server.addListener("error", function(conn, e) {
	sys.log("<"+conn.id+"> error: "+e)
});

server.addListener("close", function(conn) {
	sys.log("<"+conn.id+"> disconnected");
	server.broadcast('quit:'+conn.id);
});

server.listen(8000);