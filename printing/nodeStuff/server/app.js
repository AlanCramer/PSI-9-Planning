//Load express
var express = require('express');
var app = express();
var path = require('path');

//Load phantom
var phantom = require('phantom');

//This module puts a node wrapper around phatom to pdf conversion
var pdf = require('html-pdf');

//get URL parser
var url =require('url');

//Access file system
var fs = require('fs');

var dir = process.cwd();
//could also use __dirname
dir = path.join(dir,'psi-9-planning/printing/nodeStuff/server');

var templateDir = path.join(dir, 'templates');

var generatedPDFPath = path.join(dir,'GeneratedPDFs');

//Load html file synchronously via file system
function getTemplate(reportName) {
    var fileName = templateDir + '/' + reportName + '.html';
    return fs.readFileSync(fileName, 'utf8');
}

function getFileNameForPDF(reportName) {
    var fileName = generatedPDFPath + '/' + reportName + '.pdf';
    return fileName;
}

//Enable CORS processing
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Set printer options per Phantom - see html-pdf website
var options = { format: 'Letter' };


//Add data to htmlTemplate
function addDataToTemplate(data, html) {

}

//Encapulate above in function
function createPDF(reportName, data) {
    var fullPathAndName = './templates/' + reportName + '.html';
    var html = getTemplate(reportName);


    addDataToTemplate(data, html);

    var timeStamp = new Date().getMilliseconds().toString();
    var fileNameForPDF = getFileNameForPDF(reportName + timeStamp); // './generatedPDFs/' + reportName + '.pdf';
    console.log(fileNameForPDF);
    pdf.create(html, options).toFile(fileNameForPDF, function(err, res) {
        if (err) {
            //return console.log(err);
        }
        else {
            //console.log(res);
        }
    });
    return fileNameForPDF;
}

app.set('views', __dirname);
app.set('view engine', 'html');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Handle post from client
app.post('/', function(req, res) {
    //console.log(req);
    var parts = url.parse(req.url,true);
    var reportName = parts.query.reportName;
    var data = res.req.body;

    var fileName = createPDF(reportName, data);
    res.send(fileName);
    //res.download(pdfFullPath);
    console.log(req);
});

app.get('/getPDF', function(req, res) {
    var parts = url.parse(req.url,true);
    res.download("/Users/bobhmh/WebstormProjects/nodeTest/PSI-9-Planning/printing/nodeStuff/server/GeneratedPDFs/irc118.pdf");

});

var renderPdf = function(session, cb) {
    var page;

    try {
        session.createPage(function(_page) {
            page = _page;
            // ...
            var file = '/tmp/file.pdf';
            page.render(file, function() {
                page.close();
                page = null;
                return cb(null, file);
            });
        });
    }
    catch(e) {
        try {
            if (page != null) {
                page.close(); // try close the page in case it opened but never rendered a pdf due to other issues
            }
        } catch(e) {
            // ignore as page may not have been initialised
        }
        return cb('Exception rendering pdf:' + e.toString());
    }
};


//Starting listening
app.listen(3000);
console.log('listening on port 3000');


// Create pdf (promise)
/*pdf.create(html, options).toFile('./businesscard.pdf', function(err, res) {
 if (err) console.log(err);
 console.log(res); // { filename: '/app/businesscard.pdf' }
 });*/