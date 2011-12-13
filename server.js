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

var clients = [];

io.sockets.on('connection', function (cc) {
	clients.push(cc);
	console.log('Clients:', clients.length);
	clients.forEach(function(c) {
		c.send(JSON.stringify({'clients':clients.length}));
	});

	cc.on('message', function(data){
		//data = JSON.parse(data);
		//data.clients = clients.length;
		clients.forEach(function(c) {
			//c.send(JSON.stringify(data));
			c.send(data);
		});
	});

	cc.on('disconnect',function(){
		clients.remove(cc);
		clients.forEach(function(c) {
			c.send(JSON.stringify({'clients':clients.length}));
		});
		console.log('Clients:', clients.length);
	});
});
