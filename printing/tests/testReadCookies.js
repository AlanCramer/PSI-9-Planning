var fs = require('fs');

var url = 'https://h502000001.education.scholastic.com/HMHCentral/?cb=1467911108790;0.7240091387107479#/teacherDashboard/class?class=1e4lijv0f243ennepkvkj89a_1cqnue0&school=ij8ocgj4u7u8c386dt939nsi_1cqnue0'
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

