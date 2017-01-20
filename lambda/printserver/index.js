'use strict';

// string constants
const queryStringPropName = "queryStringParameters";
const pageUrlArgName = "url";
const bucketArgName = "bucket";
const sessionIdArgName = "jsessionid";
const pdfExtension = ".pdf";

// Node.js dependencies
const Guid = require("guid");
const parseuri = require("parseuri");
const phantom = require("phantom");
const AWS = require("aws-sdk");
const S3 = new AWS.S3();

// module/container variables
var phantomPromise = null;
var phantomInstance = null;
var containerId = Date.now().toString().slice(-6); // Any unique-ish id will do.
var configTimestamp = new Date().toISOString();

// functions

const validateArguments = function (event) {
  let err = null;
  let queryStringParameters = event[queryStringPropName];
  if (!queryStringParameters) {
    err = "event does not contain: " + queryStringPropName;
  } else if (!queryStringParameters.hasOwnProperty(pageUrlArgName)) {
    err = "(page) '" + pageUrlArgName + "' was not provided (in query string)";
  } else if (!queryStringParameters.hasOwnProperty(bucketArgName)) {
    err = "'" + bucketArgName + "' (name) was not provided (in query string)"
  }
  return err;
};

const createSessionCookie = function (decodedUrl, sessionId) {
  /*
  {"domain":"h503000001.education.scholastic.com",
  "httponly":false,
  "name":"JSESSIONID",
  "path":"/HMHCentral",
  "secure":true,
  "value":"EnR-MTWIpFpfdE-3PNL4kIX0.undefined"
  }
  */
  const parsedUri = parseuri(decodedUrl);
  const domain = parsedUri.host;
  const cookie = {
    domain: domain,
    httponly: false,
    name: 'JSESSIONID',
    path: '/HMHCentral',
    secure: true,
    value: sessionId
  }
  return cookie;
};

const setupPage = function (webpage, decodedUrl, sessionId, phantomErrorHandler) {
  console.log("setting up phantom page")
  let page = webpage;

  page.paperSize = {
    //viewportSize: { width: 960, height: 1200 },
    //zoomFactor: .1,
      width: '8.5in',
      height: '11in',
      border: '50px',
      margin: '0px',
      header: {
        height: '5cm',
        contents: function (pageNum, numPages) {
          return '<div style="text-align: right; font-size: 12px;"> Check out this header with page numbers: ' + pageNum + ' / ' + numPages + '</div>';
        }
      },
      footer: {
          height: '5cm',
          contents: function (pageNum, numPages) {
              return '<div style="text-align: right; font-size: 12px;"> Check out this footer with page numbers: ' + pageNum + ' / ' + numPages + '</div>';
          }
      }
  };

  /* Set up various event handlers on the WebPage instance */
  page.on('onConsoleMessage', function(msg) {
    console.log('page.onConsoleMessage : ', msg); // http://phantomjs.org/api/webpage/handler/on-console-message.html
  });

  page.on('onError', phantomErrorHandler); // http://phantomjs.org/api/webpage/handler/on-error.html

  page.on('onInitialized', function() {
    console.log('page.onInitialized'); // http://phantomjs.org/api/webpage/handler/on-initialized.html
  });

  page.on('onClosing', function(page) {
    console.log('page.onClosing'); // http://phantomjs.org/api/webpage/handler/on-closing.html
  });

  page.on('onResourceRequested', function(requestData) {
    console.log('page.onResourceRequested ...'); // http://phantomjs.org/api/webpage/handler/on-resource-requested.html
    for (var key in requestData) {
      console.log('Key: ' + key + ', Value: ' + requestData[key]);
    }
  });

  page.on('onResourceReceived', function(response) {
    // This 'stage' check can be removed if you want to view
    // more info about the chunks of the response as it is received.
    if (response.stage === 'end') {
      console.log('page.onResourceReceived ...'); // http://phantomjs.org/api/webpage/handler/on-resource-received.html
      for (var key in response) {
        console.log('Key: ' + key + ', Value: ' + response[key]);
      }

      for (var key in response.headers) {
        console.log(response.headers[key]);
      }
    }
  });

  page.on('onResourceError', function(requestError) {
    console.log('page.onResourceError ...'); // http://phantomjs.org/api/webpage/handler/on-resource-error.html
    for (var key in requestError) {
      console.log('Key: ' + key + ', Value: ' + requestError[key]);
    }
  });

  if (sessionId) {
    var cookie = createSessionCookie(decodedUrl, sessionId);
    console.log("adding cookie '%s' to page.", JSON.stringify(cookie));
    page.addCookie(cookie);
  };
};

const getNewFileName = function (extension) {
  const fileName = Guid.create() + extension;
  return fileName;
};

const getTempFilePath = function (fileName) {
  const tmpDir = "/tmp";
  const pathSeparator = '/';
  let filePath = tmpDir + pathSeparator + fileName;
  return filePath;
};

const getUploadRequest = function (filePath, bucketName, keyName) {
  console.log("will be uploading file: '%s' to bucket/key: '%s'/'%s'", filePath,bucketName, keyName);
  let uploadFile = fs.createReadStream(filePath);
  let params = {
    Bucket: bucketName,
    Key: keyName,
    ContentType: uploadFile.type,
    Body: uploadFile,
    ACL: 'public-read'
  };
  console.log("S3: " + JSON.stringify(S3));
  console.log("params: " + JSON.stringify(params));
  let awsRequest = S3.putObject(params);
  return awsRequest;
};

const getSignedUrlForGetObject = function (filePath, bucketName, keyName, callback) {
  const expirationSeconds = 900; // 15 minutes (900 seconds)- the default
  const operation = "getObject";
  let params = {Bucket: bucketName, Key: keyName, Expires: expirationSeconds};
  console.log("Getting signed URL for: '" + operation + "' with: " + JSON.stringify(params));
  S3.getSignedUrl(operation, params, callback);
};

const uploadRenderedPageToS3 = function (filePath, bucketName, keyName, callback) {
  let awsRequest = getUploadRequest(filePath, bucketName, keyName);
  awsRequest.
  on('success', function(response) {
    console.log("Successfully uploaded file to S3!");
    getSignedUrlForGetObject(filePath, bucketName, keyName, callback);
  }).
  on('error', function(error) {
    console.error("Error! failed to upload file to S3: " + error);
    callback(error);
  }).
  send();
};

const createAndProcessPage = function (decodedUrl, bucketName, sessionId, handlerFinishedCallback) {

  const phantomErrorHandler = function (error) {
    console.error("Got phantom error: " + error + "; shutting down phantom instance...");
    let exitPromise = phantomInstance.exit();
    exitPromise.then(function () {
      phantomInstance = null;
      console.error("Finished shutting down phantom instance and existing lambda handler");
      handlerFinishedCallback(error);
    });
  };

  let phantomPage = null;
  let fileName = null;
  let filePath = null;

  console.log("Creating page...");
  phantomInstance.createPage().
    then( function (webpage) {
      console.log("Page created (successfully).");
      phantomPage = webpage;
      setupPage(webpage, decodedUrl, sessionId, phantomErrorHandler);
      console.log("Using page to open URL: " + decodedUrl);
      return phantomPage.open(decodedUrl);
    }, handlerFinishedCallback).
    then( function () {
      fileName = getNewFileName(pdfExtension);
      filePath = getTempFilePath(fileName);
      console.log("Rendering opened page to file: %s", filePath);
      return phantomPage.render(filePath);
    }, handlerFinishedCallback).
    then( function () {
      let keyName = fileName;
      uploadRenderedPageToS3(filePath, bucketName, keyName, handlerFinishedCallback);
    }, handlerFinishedCallback);
};

exports.handler = (event, context, handlerFinishedCallback) => {

  console.log("lambda handler called with: " + JSON.stringify(event));

  let argsError = validateArguments(event);
  if (argsError) {
    handlerFinishedCallback(argsError);
  } else {
    let args = event[queryStringPropName];
    let encodedUrlOfPageToPrint = args[pageUrlArgName];
    let decodedUrlOfPageToPrint = decodeURIComponent(encodedUrlOfPageToPrint);
    let bucketName = args[bucketArgName];
    let sessionId = args[sessionIdArgName];

    const capturePhantomInstance = function(instance) {
      if (phantomInstance) {
        console.warn("Already captured phantom instance!");
      } else {
        console.log("Phantom instance created: " + JSON.stringify(instance));
        phantomInstance = instance;
      }
      createAndProcessPage(decodedUrlOfPageToPrint, bucketName, sessionId, handlerFinishedCallback);
    };

    // create phantomInstance object if it doesn't already exist (once per container)
    if (phantomInstance) {
      console.log("Container %s reusing phantom instance created at: %s", containerId, configTimestamp);
      createAndProcessPage(decodedUrlOfPageToPrint, bucketName, sessionId, handlerFinishedCallback);
    } else {
      if (!phantomPromise) {
        console.log("Container %s creating new phantom instance at: %s", containerId, configTimestamp);
        let phantomArgs = [];
        let phantomOptions =  {
            logLevel: 'debug',
          };
        phantomPromise = phantom.create(phantomArgs,phantomOptions);
        phantomPromise.then(capturePhantomInstance,handlerFinishedCallback);
      }
    }
  }
};
