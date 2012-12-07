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
var draws = [];

io.sockets.on('connection', function (cc) {
	clients.push(cc);
	console.log('Clients:', clients.length);
	clients.forEach(function(c) {
		c.send(JSON.stringify({'clients':clients.length}));
	});
	if(draws) {
		console.log("Send points to new client");
		for(var i=0; i<draws.length; i++) {
			cc.send(JSON.stringify({draw: draws[i]}));
		}
	}

	cc.on('message', function(data){
		var pdata = "";
		try {
			pdata = JSON.parse(data);
		} catch(e) {
			console.log("pasring failed! ",e);
		}
		clients.forEach(function(c) {
			//c.send(JSON.stringify(data));
			c.send(data);
		});
		if(pdata.draw && pdata.draw.color && pdata.draw.points && pdata.draw.points.length>0) draws.push(pdata.draw);
		if(pdata.clear) draws = [];
		
		console.log(pdata.draw);
		console.log(draws);
		
	});

	cc.on('disconnect',function(){
		clients.remove(cc);
		clients.forEach(function(c) {
			c.send(JSON.stringify({'clients':clients.length}));
		});
		console.log('Clients:', clients.length);
	});
});
