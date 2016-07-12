
var url = 'https://h502000001.education.scholastic.com/HMHCentral/?cb=1468268146349;0.408462481187881#/teacherDashboard/class?class=p8libnvtn19ap6rdu7me8h61_1cqnue0&school=ij8ocgj4u7u8c386dt939nsi_1cqnue0'

var fs = require('fs');
var CookieJar = "cookiejar.json";

var page = require('webpage').create();

if(fs.isFile(CookieJar)) {
    Array.prototype.forEach.call(JSON.parse(fs.read(CookieJar)), function(x){
        phantom.addCookie(x);
    });
}

page.open(url, function(status) {
  var title = page.evaluate(function() {
    return document.title;
  });

  console.log('here');
  fs.write(CookieJar, JSON.stringify(phantom.cookies), "w");
  phantom.exit();
});
