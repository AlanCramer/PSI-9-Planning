// Node.js dependencies
var http = require('http');
var path = require('path');
// Express dependencies
var express = require('express');
var bodyParser = require('body-parser');
// Phantom.js-Node integration
var phantom = require('phantom');

// Create an Express application object
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

// Set the port
var port = process.env.PORT || 3000;

// Middleware for parsing 'Content-Type': 'application/json'
app.use(bodyParser.json());

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

function createSessionCookie(decodedUrl, sessionId) {
  /*
  {"domain":"h503000001.education.scholastic.com",
  "httponly":false,
  "name":"JSESSIONID",
  "path":"/HMHCentral",
  "secure":true,
  "value":"EnR-MTWIpFpfdE-3PNL4kIX0.undefined"
  }
  */
  var parsedUri = parseUri(decodedUrl);
  var domain = parsedUri.host;
  var cookie = {
    domain: domain,
    httponly: false,
    name: 'JSESSIONID',
    path: '/HMHCentral',
    secure: true,
    value: sessionId
  }
  return cookie;
}

// Serve index.html for all GET requests
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

// Log the request body and echo it back to the client
app.post('/', function(req, res) {
  console.log(req.url); // Check if the requests's body contains the expected data
//  res.send(req.body); // Test out echoing the data back to the client

  /* Begin Phantom experiment*/
  var ph = null;
  var page = null;

  console.log('POST received. Spinning up a Phantom instance...');
  // Create a Phantom instance
  phantom.create()
    .then(function(instance) {
        console.log('create started');
      // Capture the new Phantom instance in a closure variable
      ph = instance;

      // Create a WebPage instance
      return ph.createPage();

    }).then(function(webpage) {
        console.log('page created')
      // Capture the new WedPage instance in a closure variable
      page = webpage;

      // console.log('Phantom page: ', page); // For inspecting the newly created WebPage instance

      /* Set up various event handlers on the WebPage instance */
      page.on('onConsoleMessage', function(msg) {
        console.log('Console log from Phantom: ', msg); // http://phantomjs.org/api/webpage/handler/on-console-message.html
      });

      page.on('onError', function(msg) {
        console.log('Error occurred in Phantom: ', msg); // http://phantomjs.org/api/webpage/handler/on-error.html
      });

      // page.on('onLoadFinished', function(status) {
      //   console.log('Load finished, status : ' + status); // http://phantomjs.org/api/webpage/handler/on-load-finished
      //   console.log('about to render');
      // 	page.render('output.pdf');
      // 	//ph.exit(); // Close the Phantom instance

      // });

      page.on('onInitialized', function() {
        console.log('Page initialized'); // http://phantomjs.org/api/webpage/handler/on-initialized.html
      });

      page.on('onClosing', function(page) {
        console.log('Page is closing. Goodbye!'); // http://phantomjs.org/api/webpage/handler/on-closing.html
      });

      page.on('onResourceRequested', function(requestData) {
        console.log('Resource requested. Here is the data...'); // http://phantomjs.org/api/webpage/handler/on-resource-requested.html
        for (var key in requestData) {
          console.log('Key: ' + key + ', Value: ' + requestData[key]);
        }
      });

      page.on('onResourceReceived', function(response) {
        // This 'stage' check can be removed if you want to view
        // more info about the chunks of the response as it is received.
        if (response.stage === 'end') {
          console.log('Resource received. Here is the data...'); // http://phantomjs.org/api/webpage/handler/on-resource-received.html
          for (var key in response) {
            console.log('Key: ' + key + ', Value: ' + response[key]);
          }

          for (var key in response.headers) {
            console.log(response.headers[key]);
          }
        }
      });

      page.on('onResourceError', function(requestError) {
        console.log('Error requesting resource. Here is the data...'); // http://phantomjs.org/api/webpage/handler/on-resource-error.html
        for (var key in requestError) {
          console.log('Key: ' + key + ', Value: ' + requestError[key]);
        }
      });

    }).then(function() {
			var encodedUrl = req.query.url;
			var sessionId = req.query.jsessionid;
			var decodedUrl = decodeURIComponent(encodedUrl);
			console.log("request query string args: url=" + decodedUrl + " , jsessionid=" + sessionId);
			var cookie = createSessionCookie(decodedUrl, sessionId);
			console.log("cookie: " + JSON.stringify(cookie));
			page.addCookie(cookie);
			console.log("opening page: " + decodedUrl);
			return page.open(decodedUrl);
		}).then( function () {
						console.log("opened page successfully");
						setTimeout(function ()  { // really want onLoadFinished, but that's not working
							console.log('about to render');
							page.render('output.pdf');
							ph.exit(); // Close the Phantom instance
							res.download('./output.pdf', 'output.pdf');
						}, 7000);
					}, function () {
						console.log("open page failed");
    }).catch(function(error) {
      console.log(error);
      ph.exit(); // Always remember to close the Phantom instance no matter what!
    });

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
