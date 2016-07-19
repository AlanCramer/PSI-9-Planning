//Load express
var express = require('express');
var app = express();

//Load phantom
var phantom = require('phantom');
var sitepage = null;

//Parse URL
var url =require('url');

//Access file system
var fs = require('fs');

//This puts a node wrapper around phatom to pdf conversion
var pdf = require('html-pdf');

//Load html file synchronously via file system
var html = fs.readFileSync('./test/sample.html', 'utf8');

//Set printer options per Phantom - see html-pdf website
var options = { format: 'Letter' };

// Create pdf (promise)
pdf.create(html, options).toFile('./businesscard.pdf', function(err, res) {
    if (err) console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
});


//Encapulate above in function
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

var fixtureData = require('./fixture_data.json');
app.locals.barChartHelper = require('./bar_chart_helper');


app.get('/', function(req, res) {
    var parts = url.parse(req.url,true);
    createPDF(1, 2);
    console.log(parts.query.reportName);
    res.send('hello world'+ Date());
});

app.listen(3000);
console.log('listening on port 3000');
