var express = require('express');
// Set the port
var port = process.env.PORT || 3000;

var scriptDir = process.cwd();
var argv = process.argv;
if (argv.length > 2)
{
  scriptDir = argv[2];
}
//  console.log("About to call express() : ", express);
  var app = express();
  app.use(express.static(scriptDir));
  // Start listening on 'port'
  var server = app.listen(port, function() {
    console.log('Server listening on port: %d in directory: %s', port, scriptDir);
  });
