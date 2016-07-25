
var url = 'WAC.html'
var fs = require('fs');
var CookieJar = "cookiejar.json";

var page = require('webpage').create();


page.paperSize = {
	//viewportSize: { width: 960, height: 1200 },
	//zoomFactor: .1,
    width: '8.5in',
    height: '11in',
    border: '50px',
    margin: '0px',
    header: {
    	height: '2cm',
    	contents: phantom.callback(function (pageNum, numPages) {
            return '<div style="text-align: left; font-size: 12px;">This is the header, lovely, no?</div>';
        })
    },
    footer: {
        height: '3cm',
        contents: phantom.callback(function (pageNum, numPages) {
            return '<div style="text-align: right; font-size: 12px;"> Check out this footer with page numbers: ' + pageNum + ' / ' + numPages + '</div>';
        })
    }
};

if(fs.isFile(CookieJar)) {
    Array.prototype.forEach.call(JSON.parse(fs.read(CookieJar)), function(x){
        phantom.addCookie(x);
        console.log("added " + JSON.stringify(x));
    });
}


page.open(url, function(status) {

	console.log('here');
	console.log('typeof window.setTimeout: ' + (typeof window.setTimeout));
	window.setTimeout(function() {
		console.log('hello!');
	    page.render('report.pdf')
	    phantom.exit();
	}, 2000);

});

