var express = require('express');
var path = require('path');
var http = require('http');
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

var port = process.env.PORT || 3000;
var publicPath = path.resolve(__dirname, 'dist');

// Serve index.html for all GET requests
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Serve static files from the 'dist' directory
app.use(express.static(publicPath));

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

server.listen(port, function() {
  console.log('Server running on port ' + port);
});
