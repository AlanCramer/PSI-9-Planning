var fs = require('fs');

var url = 'https://h503000001.education.scholastic.com/HMHCentral/#/leaderCentral/dataAnalytics?report=district-snapshot'
var page = require('webpage').create();

var CookieJar = "cookiejar.json";
var contents  = fs.read(CookieJar);
console.log(contents);
page.cookies = contents;
console.log(page.cookies);
console.log(typeof page.cookies);


page.open(url, function(status) {

	console.log('here');
	console.log('typeof window.setTimeout: ' + (typeof window.setTimeout));
	window.setTimeout(function() {
		console.log('hello!');
	    page.render('tcpage.pdf')
	    phantom.exit();
	}, 1000);

});
