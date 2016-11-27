
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
    	height: '50px',
    	contents: phantom.callback(function (pageNum, numPages) {
/*
        var title = 'Workshop Asssessment Class Report';
        var subTitle = 'Class 1 - Read 180';
        var logoFile = 'images/d3Report/work_shop_logo.svg';

        var result = '<div>';
        result = result + '<div id="title" style="text-align: right; font-size 24px;"><label text="' + title + '"/></div>';
        result = result + '<div class="rightbox"><img src="' + logoFile + '"/></div>';
        result = result + '<div id="subtitle"><label text="' + subTitle + '"/></div>';
        result = result + '</div>';
        console.log(result);
        return result;
*/
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
