
var fs = require('fs'),
	args = require('system').args,
    page = require('webpage').create();

var url = 'longStandAlone.html';

//page.content = fs.read(args[1]);
page.viewportSize = {width: 600, height: 600};
page.paperSize = {
    width: '8in',
    height: '11.5in',
    border: '0px',
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
            return '<div style="text-align: right; font-size: 12px;">' + pageNum + ' / ' + numPages + '</div>';
        })
    }
};

page.open(url, function(status) {

	console.log('here');
	console.log('typeof window.setTimeout: ' + (typeof window.setTimeout));
	window.setTimeout(function() {
		console.log('hello!');
	    page.render('tcpage.pdf')
	    phantom.exit();
	}, 1000);

});
