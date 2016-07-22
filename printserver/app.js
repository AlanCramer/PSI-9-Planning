var express = require('express');
var http = require('http');
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

// Serve index.html for all GET requests
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// Enable CORS processing - Apparently, not needed for Socket.io's "Hello World"...?
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// "Hello World" test for Socket.io
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

// Start listening on port 3000
server.listen(3000);
