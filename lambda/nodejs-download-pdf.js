'use strict';

console.log('Loading function');

//const aws = require('aws-sdk');
const parseuri = require('parseuri');
//const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const PATH_SEPARATOR = '/';

var fs = require('fs');
var request = require('request');

var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var sendReq = request.get(url);

    // verify response code
    sendReq.on('response', function(response) {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }
    });

    // check for request errors
    sendReq.on('error', function (err) {
        fs.unlink(dest);

        if (cb) {
            return cb(err.message);
        }
    });

    sendReq.pipe(file);

    file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)

        if (cb) {
            return cb(err.message);
        }
    });
};

var fileUrl = decodeURIComponent(process.argv.slice(2));
console.log("fileUrl: " + fileUrl);
var parsedUrl = parseuri(fileUrl);
var destFileName = parsedUrl.file;
console.log("parseduri(" + fileUrl + ").file : " + destFileName);
var tmpDir = "/tmp";
var destFilePath = tmpDir + PATH_SEPARATOR + destFileName;
console.log("destFilePath = " + destFilePath);
var callback = function(msg) {
  console.log("callback - file is downloaded");
  if (msg)
  {
    console.log("callback(msg) == " + msg);
  }
};
  download(fileUrl, destFilePath, callback);
