
var url = 'http://localhost:4000/#/dataAnalytics?class=orljsmjj7vb6d81le936gli6_1cqnue0&report=103.1'
var page = require('webpage').create();
page.open(url, function(status) {
  var title = page.evaluate(function() {
    return document.html;
  });
  console.log('Page title is ' + title);
  phantom.exit();
});

