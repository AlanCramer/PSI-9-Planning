
var url = 'https://h503000001.education.scholastic.com/HMHCentral/#/leaderCentral/dataAnalytics?report=district-snapshot'

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
