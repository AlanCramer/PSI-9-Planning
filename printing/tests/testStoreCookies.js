
var url = 'https://h503000001.education.scholastic.com/HMHCentral/#/dataAnalytics?class=ru479hdip5lrb9lf6p91dr5s_1uamve0&report=103.1'

var fs = require('fs');
var CookieJar = "cookiejar.json";

var page = require('webpage').create();
page.open(url, function(status) {
  var title = page.evaluate(function() {
    return document.title;
  });

  console.log('here');
  fs.write(CookieJar, JSON.stringify(phantom.cookies), "w");
  phantom.exit();
});
