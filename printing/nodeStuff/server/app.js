//Load express
var express = require('express');
var app = express();
var path = require('path');


//Load phantom
var phantom = require('phantom');
var sitepage = null;

//Parse URL
var url =require('url');


//Access file system
var fs = require('fs');

var dir = process.cwd();
dir = path.join(dir,'psi-9-planning/printing/nodeStuff/server');
//console.log(dir);
//console.log(__dirname);


//Enable CORS processing
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


var templateDir = path.join(dir, 'templates');

var generatedPDFPath = path.join(dir,'GeneratedPDFs');

//This module puts a node wrapper around phatom to pdf conversion
var pdf = require('html-pdf');

//Load html file synchronously via file system
function getTemplate(reportName) {
    var fileName = templateDir + '/' + reportName + '.html';
    return fs.readFileSync(fileName, 'utf8');
}

function getFileNameForPDF(reportName) {
    var fileName = generatedPDFPath + '/' + reportName + '.pdf';
    return fileName;
}

//Test getTemplate
//var html = getTemplate('lrs1');

//Set printer options per Phantom - see html-pdf website
var options = { format: 'Letter' };

// Create pdf (promise)
/*pdf.create(html, options).toFile('./businesscard.pdf', function(err, res) {
    if (err) console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
});*/


//Encapulate above in function
function createPDF(reportName, data) {

    var fullPathAndName = './templates/' + reportName + '.html';
    //console.log(__dirname);
    //console.log(fullPathAndName);

   // var html = fs.readFileSync(fullPathAndName, 'utf8');
    var html = getTemplate(reportName);
    var timeStamp = new Date().getMilliseconds().toString();
    var fileNameForPDF = getFileNameForPDF(reportName + timeStamp); // './generatedPDFs/' + reportName + '.pdf';
    pdf.create(html, options).toFile(fileNameForPDF, function(err, res) {
        if (err) return console.log(err);

        console.log(res); // { filename: '/app/businesscard.pdf' }
    });
}

//app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

//var fixtureData = require('./fixture_data.json');

//////////////////////////////////////Stuff to handle post from client
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


// POST http://localhost:8080/api/users
// parameters sent with
app.post('/', function(req, res) {
    //console.log(req);
    var parts = url.parse(req.url,true);
    var reportName = parts.query.reportName;
    //console.log(parts);
    //console.log(parts.body);
    var data = res.req.body;
    //console.log('Report name: ' + reportName + '  Data: ' + data);

    res.send('Report: '+ reportName + " requested at " + Date());

    createPDF(reportName, data);
    //res.send(user_id + ' ' + token + ' ' + geo);
});
/////////////////////////////////////////////////


app.get('/', function(req, res) {
    var parts = url.parse(req.url,true);
    //createPDF(1, 2);
    console.log(parts.query.reportName);
    res.send('hello world'+ Date() + '  ReportName: ' + parts.query.reportName);

});

app.listen(3000);
console.log('listening on port 3000');
