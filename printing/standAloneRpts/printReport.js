
var url = 'WAC.html'
var fs = require('fs');
var CookieJar = "cookiejar.json";

var page = require('webpage').create();

var versionText = "unknown";

var getTitle = function () {
  var title = 'Workshop Asssessment Class Report';
  return title;
};

var getSubTitle = function () {
  var subTitle = 'Class ' + versionText + ' - Read 180';
  return subTitle;
}

var getLogoFile = function () {
  var logoFile = 'images/d3Report/work_shop_logo.svg';
  return logoFile;
};

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

        var title = getTitle();
        var subTitle = getSubTitle();
        var logoFile = getLogoFile();

        var result = '<div>';
        result = result + '<div id="title" style="text-align: left; font-size: 24px;"><h1>' + title + '</h1></div>';
        result = result + '<div class="rightbox"><img src="' + logoFile + '"/></div>';
        result = result + '<div id="subtitle">' + subTitle + '</div>';
        result = result + '</div>';
        console.log(result);
        return result;

//        return '<div style="text-align: left; font-size: 12px;">This is the header, lovely, no?</div>';
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

page.open("http://phantomjs.org/", function(status) {
    if (status === "success") {
        console.log("loaded http://phantomjs.org with status: " + status);
        page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js", function() {
            versionText = page.evaluate(function() {
                // lastest version on the web
                var version = $("span.version").text();
                console.log("$(\"span.version\").text() -> " + version);
                return version;
              });
              page.open(url, function(status) {
                console.log('here');
                console.log('typeof window.setTimeout: ' + (typeof window.setTimeout));
                window.setTimeout(function() {
                  console.log('hello!');
                  page.render('report.pdf')
                  phantom.exit();
              }, 2000);
            });
        });
    } else {
      phantom.exit(1);
    }
});
