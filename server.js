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
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(parseInt(process.env.C9_PORT, 10) || 1337);
io.set('log level', 1);

var clients = [];

io.sockets.on('connection', function (cc) {
	clients.push(cc);
	console.log('Clients:', clients.length);
	clients.forEach(function(c) {
		c.send(JSON.stringify({'clients':clients.length}));
	})

	cc.on('message', function(data){
		data = JSON.parse(data);
		data.clients = clients.length;
		clients.forEach(function(c) {
			c.send(JSON.stringify(data));
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
