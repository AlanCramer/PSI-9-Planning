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

// Serve index.html for all GET requests
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Log the request body and echo it back to the client
app.post('/', function(req, res) {
  // console.log(req.body); // Check if the requests's body contains the expected data
  // res.send(req.body); // Test out echoing the data back to the client

  /* Begin Phantom experiment*/
  var ph = null;
  var page = null;

  console.log('POST received. Spinning up a Phantom instance...');
  // Create a Phantom instance
  phantom.create()
    .then(function(instance) {
      // Capture the new Phantom instance in a closure variable
      ph = instance;

      // Create a WebPage instance
      return ph.createPage();

    }).then(function(webpage) {
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
      // Inject a <script> element onto the page with 'src' set to D3's CDN download address
      // page.includeJs('https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.js');

    }).then(function() {
      // page.injectJs() returns true if injection is successful, otherwise false
      console.log ('injecting d3');
      return page.injectJs('./standAloneReports/d3/d3.min.js');

    }).then(function() {
      // page.injectJs() returns true if injection is successful, otherwise false
      console.log('injecting reportUtil');
      return page.injectJs('./standAloneReports/reportUtil.js');

    }).then(function() {
      // page.injectJs() returns true if injection is successful, otherwise false
      console.log('injecting horizBarChart');
      return page.injectJs('./standAloneReports/horizBarChart.js');

    }).then(function() {
      // page.injectJs() returns true if injection is successful, otherwise false
      return page.injectJs('./constructReport.js');

    }).then(function(scriptLoaded) {
      // Check that our script was injected - this should return 'true'
      console.log(scriptLoaded);

      page.evaluate(function(data, foo) {
        // Woah! How does referencing 'd3' not throw a ReferenceError?

        // page.evaluate() runs the provided function from within the Phantom process.
        // Thus, you need to remember that the context / memory space are completely
        // different than here in app.js. What we are logging in this case is the
        // <script> element injected by the previous call to page.includeJs()

        // Also, notice that this console log comes through the page's 'onConsoleMessage'
        // event handler we set up above. Again, we are in the context of the Phantom
        // process, so logging is happening...but it is not apparent unless we hook into
        // the 'onConsoleMessage' event and pipe the logs back over to the Node process.

        console.log(d3.select('body').html()); // Check if D3 was loaded properly by interacting with it
        console.log(data); // Check if our stringified header data made it to Phantom
        console.log(foo); // Test out passing a second argument to page.evaluate()
        console.log(constructReport); // Check if our custom function defined with page.injectJs() is available

        // Clear the <script> used to load D3 out of the page.
        // Then, parse the data and run it through our custom function.
        // Finally, check if it worked by console logging the contents of the <body>.
        d3.select('body').html('');
        data = JSON.parse(data);
        constructReport(data);
        console.log(d3.select('body').html());

      }, JSON.stringify(req.body), 'foo');

      console.log('phantom setup complete');

      setTimeout(function ()  { // really want onLoadFinished, but that's not working
        console.log('about to render');
      	page.render('output.pdf'); 
      	ph.exit(); // Close the Phantom instance
      	res.download('./output.pdf', 'output.pdf');

      }, 3000);

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
