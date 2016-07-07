//var url = 'http://localhost:4000/#/dataAnalytics?class=orljsmjj7vb6d81le936gli6_1cqnue0&report=103.1';
var url = 'https://www.google.com'
var page = require('webpage').create();
var output = 'example.pdf';

page.open(url, function(status) {
  console.log("Status: " + status);
  if(status === "success") {
     console.log('here');
     page.render('example1.pdf');
     console.log(typeof window.setTimeout);

  }
  phantom.exit();
});
