var fs = require('fs');

var url = 'https://h502000001.education.scholastic.com/HMHCentral/?cb=1467918862751;0.6812395277277832#/teacherDashboard/class?class=1e4lijv0f243ennepkvkj89a_1cqnue0&school=ij8ocgj4u7u8c386dt939nsi_1cqnue0'
var page = require('webpage').create();


var CookieJar = "cookiejar.json";
var pageResponses = {};
page.onResourceReceived = function(response) {
    pageResponses[response.url] = response.status;
    fs.write(CookieJar, JSON.stringify(phantom.cookies), "w");
};
if(fs.isFile(CookieJar))
    Array.prototype.forEach.call(JSON.parse(fs.read(CookieJar)), function(x){
        phantom.addCookie(x);
    });

page.open(url, function(status){

   page.cookies.map(function(c) { 
	console.log('cookies: ' + JSON.stringify(c));
	});

   window.setTimeout(function() {
		console.log('hello!');
	    page.render('new.pdf')
	    phantom.exit();
	}, 1000);

});
