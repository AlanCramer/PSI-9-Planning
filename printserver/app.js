// Node.js dependencies
var http = require('http');
var path = require('path');
// Express dependencies
var express = require('express');
var bodyParser = require('body-parser');

// Create an Express application object
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

// Set the port
var port = process.env.PORT || 3000;

// Middleware for parsing 'Content-Type': 'application/json'
app.use(bodyParser.json());

// Serve index.html for all GET requests
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Log the request body and echo it back to the client
app.post('/', function(req, res) {
  console.log(req.body);
  res.send(req.body);
});

// "Hello World" test for Socket.io
io.on('connection', function(socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

// Start listening on 'port'
server.listen(port, function() {
  console.log('Server listening on port ' + port);
});
