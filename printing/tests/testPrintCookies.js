
var url = 'https://h502000001.education.scholastic.com/HMHCentral/?cb=1467911108790;0.7240091387107479#/teacherDashboard/class?class=1e4lijv0f243ennepkvkj89a_1cqnue0&school=ij8ocgj4u7u8c386dt939nsi_1cqnue0'
var page = require('webpage').create();
page.open(url, function(status) {
  var title = page.evaluate(function() {
    return document.title;
  });

  console.log('here');
  console.log('typeof page.cookies' + (typeof page.cookies));
  console.log('cookies: ' + page.cookies);
  page.cookies.map(function(ck) { console.log(JSON.stringify(ck)); });
  phantom.exit();
});

