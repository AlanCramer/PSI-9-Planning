'use strict';

console.log('Loading script and its dependencies...');
const AWS = require('aws-sdk');
const parseuri = require('parseuri');
const fs = require('fs');
const request = require('request');
const path = require('path');
var S3 = new AWS.S3();

const getProcessArgs = function () {
    let args = {};
    args.encodedFileUrl = process.argv[2];
    args.bucketName = process.argv[3];
    args.accessKeyId= process.argv[4];
    args.secretAccessKey = process.argv[5];
    return args;
};

const getQueryStringArgs = function (queryStringParams) {
    let args = {};
    args.encodedFileUrl = queryStringParams.url;
    args.bucketName = queryStringParams.bucket;
    return args;
};

const copyUrlToS3 = function (args) {
  console.log("called copyUrlToS3 with args: " + JSON.stringify(args));
  let fileUrl = decodeURIComponent(args.encodedFileUrl);
  console.log("fileUrl: " + fileUrl);
  let parsedUrl = parseuri(fileUrl);
  let destFileName = parsedUrl.file;
  console.log("parseduri(" + fileUrl + ").file : " + destFileName);
  const tmpDir = "/tmp";
  const PATH_SEPARATOR = '/';
  let destFilePath = tmpDir + PATH_SEPARATOR + destFileName;
  console.log("destFilePath = " + destFilePath);

const download = function(url, dest, cb) {
    if (!url) {
      if (cb) {
        return cb('No url provided');
      }
    }

    if (!dest) {
      if (cb) {
        return cb('No dest provided');
      }
    }

    console.log("Downloading from url: " + url + " to destination file path: " + dest);
    let sendReq = request.get(url);

    // verify response code
    sendReq.on('response', function(response) {
        if (response.statusCode !== 200 && cb) {
            let errMsg = 'Response status was ' + response.statusCode;
            return cb(errMsg);
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

const upload = function() {

  if (!S3) {
    console.log("No S3 available to upload!");
  }
  else if (!args.bucketName) {
    console.log("No target bucket name provided!");
  }
  else {
    let uploadFile = fs.createReadStream(destFilePath);
    let fileName = path.parse(destFilePath).base;
    console.log("parsed file name: '" + fileName + "'");
    let params = {
        Bucket: args.bucketName,
        Key: fileName,
        ContentType: uploadFile.type,
        Body: uploadFile,
        ACL: 'public-read'
    };
    console.log("uploading file: " + destFilePath + " to bucket: " + args.bucketName);
    console.log("S3: " + JSON.stringify(S3));
    console.log("params: " + JSON.stringify(params));
    let awsRequest = S3.putObject(params, function (err, data) {
      if (err)
      {
        console.log("Failed to upload file: " + JSON.stringify(err));
      }
      else {
        console.log("Succcessfully uploaded file - got data: " + JSON.stringify(data));
      };
    });
    return awsRequest;
  };
}

const doneDownloadingCallback = function(msg) {
  let awsRequest = null;
  if (msg) {
    console.log("callback(msg) == " + msg);
  }
  else {
    awsRequest = upload();
  }
  return awsRequest;
};

  let awsRequest = download(fileUrl, destFilePath, doneDownloadingCallback);
};
/*
let args = getProcessArgs();
if (args.accessKeyId && args.secretAccessKey)
{
  console.log("Setting up default credentials to AWS");
  let credentials = new AWS.Credentials({accessKeyId: args.accessKeyId, secretAccessKey: args.secretAccessKey});
  AWS.config.credentials = credentials;
  delete args.accessKeyId;
  delete args.secretAccessKey;
}
S3 = new AWS.S3();
copyUrlToS3(args);
*/
exports.handler = (event, context, callback) => {
  console.log("running handler with event: " + JSON.stringify(event));
  if (!event.queryStringParameters) {
    console.log("Missing event.queryStringParameters!");
  }
  else {
    let args = getQueryStringArgs(event.queryStringParameters);
    copyUrlToS3(args);
  }
};
