Array.prototype.remove = function(e) {
  for (var i = 0; i < this.length; i++) {
    if (e == this[i]) { return this.splice(i, 1); }
  }
};

var app = require('http').createServer(function  (req, res) {
	fs.readFile(__dirname + '/foo.html', 'utf8', function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading file');
		}
		res.writeHead(200);
		res.end(data);
	});
});
var fs = require('fs');
var io = require('socket.io').listen(app);
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

app.listen(parseInt(process.env.C9_PORT, 10) || process.env.PORT || 1337);
io.set('log level', 1);

var clients = 0;
var draws = [];

var rooms = {}; // contains draw lists 

io.sockets.on('connection', function (cc) {
	var room = "";
	cc.on('room', function(data){
		room = String(data);
		cc.join(room);
		io.sockets.in(room).emit( "clients", io.sockets.clients(room).length );
		console.log("Clients in \""+room+"\": ", io.sockets.clients(room).length );
		
		if(rooms[room]) {
			for(var i=0; i<rooms[room].length; i++) {
				cc.emit("draw", rooms[room][i]);
			}
		}
	});
	cc.on("clear", function(data){
		delete rooms[room];
		io.sockets.in(room).emit("clear", data);
	});
	cc.on("draw", function(data){
		io.sockets.in(room).emit("draw", data);
		if(rooms[room]==undefined) rooms[room] = [];
		rooms[room].push(data);
		
	});
	cc.on('disconnect',function(){
		io.sockets.in(room).emit( 'clients', io.sockets.clients(room).length );
		console.log("Clients in \""+room+"\": ", io.sockets.clients(room).length );
	});
});
