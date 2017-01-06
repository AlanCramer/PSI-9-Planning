'use strict';

console.log('Loading script and its dependencies...');
const aws = require('aws-sdk');
const parseuri = require('parseuri');
const fs = require('fs');
const request = require('request');
const path = require('path');

const getArgs = function () {
    let args = {};
    let argv = process.argv;
    args.fileUrl = decodeURIComponent(argv[2]);
    args.bucketName = argv[3];
    args.accessKeyId= argv[4];
    args.secretAccessKey = argv[5];
    return args;
};

const download = function(url, dest, cb) {
    console.log("Downloading from url: " + url + " to destination file path: " + dest);
    let sendReq = request.get(url);

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

    let file = fs.createWriteStream(dest);

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

var args = getArgs();
var fileUrl = args.fileUrl;
console.log("fileUrl: " + fileUrl);
var parsedUrl = parseuri(fileUrl);
var destFileName = parsedUrl.file;
console.log("parseduri(" + fileUrl + ").file : " + destFileName);
var tmpDir = "/tmp";
const PATH_SEPARATOR = '/';
var destFilePath = tmpDir + PATH_SEPARATOR + destFileName;
console.log("destFilePath = " + destFilePath);
var bucket = new aws.S3({accessKeyId: args.accessKeyId,
                        secretAccessKey: args.secretAccessKey,
                        params: {Bucket: args.bucketName}
                      });

const upload = function() {

  console.log("uploading file: " + destFilePath + " to bucket: " + args.bucketName);
  let uploadFile = fs.createReadStream(destFilePath);
  let fileName = path.parse(destFilePath).base;
  console.log("parsed file name: '" + fileName + "'");
  let params = {
      Key: fileName,
      ContentType: uploadFile.type,
      Body: uploadFile,
      ACL: 'public-read'
  };
  if (!bucket)
  {
    console.log("No bucket available to upload");
  }
  else
  {
    bucket.putObject(params, function (err, data) {
      if (err)
      {
        console.log("Failed to upload file: " + JSON.stringify(err));
      }
      else {
        console.log("Succcessfully uploaded file - got data: " + JSON.stringify(data));
      }
    });
  }
}

const doneDownloadingCallback = function(msg) {
  console.log("callback - file is downloaded");
  if (msg)
  {
    console.log("callback(msg) == " + msg);
  }
  upload();
};

download(fileUrl, destFilePath, doneDownloadingCallback);
