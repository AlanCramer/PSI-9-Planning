var express = require('express');
var app = express();
var phantom = require('phantom');
var sitepage = null;
var url =require('url');
var fs = require('fs');

var pdf = require('html-pdf');

var html = fs.readFileSync('./test/sample.html', 'utf8');
var options = { format: 'Letter' };
console.log(html);
pdf.create(html, options).toFile('./businesscard.pdf', function(err, res) {

    if (err) console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
});


function createPDF(template, data) {
    var html = fs.readFileSync('./test/sample.html', 'utf8');

    pdf.create(html, options).toFile('./businesscard.pdf', function(err, res) {
        if (err) return console.log(err);
        //console.log(res); // { filename: '/app/businesscard.pdf' }
    });
}
app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

/*var webPage = require('webpage');*/

var fixtureData = require('./fixture_data.json');
app.locals.barChartHelper = require('./bar_chart_helper');


app.get('/', function(req, res) {

    //test();
    var parts = url.parse(req.url,true);
    createPDF(1, 2);
    console.log(parts.query.reportName);
    res.send('hello world'+ Date());
    //res.render()
  //res.render('index', { fixtureData: fixtureData });

    /*if (!sitepage) return;
    if (!sitepage.content) return;
    console.log('Ready to respond');*/
    /*res.send(sitepage.content);
    console.log('Responded');
    sitepage.render('testPdf.pdf');
    console.log('Pdf generated');*/
});
/*function test() {
 phantom.create();
 return;
 phantom.create()
 .then(function (instance) {
 phInstance = instance;
 return instance.createPage();
 })
 .then(function (page) {
 sitepage = page;
 page.content = '<html><body><p>Hello world</p></body></html>';
 return page; // page.open('https://stackoverflow.com/');
 })
 .then(function (status) {
 console.log(status);
 return sitepage.property('content');
 })
 .then(function (content) {
 console.log(content);
 sitepage.close();
 phInstance.exit();
 })
 .catch(function (error) {
 console.log(error);
 phInstance.exit();
 });
 }*/


app.listen(3000);
console.log('listening on port 3000');
