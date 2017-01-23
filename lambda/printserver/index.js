'use strict';

// string constants
// query string parameters (intended for API gateway)
const queryStringPropName = "queryStringParameters";
const urlQsName = "url";
const bucketQsName = "bucket";
const sessionIdQsName = "jsessionid";
// internal args properties
const urlPropName = "encodedFileUrl";
const bucketPropName = "bucketName";
const sessionIdPropName = "jsessionid";
const accessKeyIdPropName = "accessKeyId";
const secretAccessKeyPropName = "secretAccessKey";
// PDF extension of temporary file to render page
const pdfExtension = ".pdf";

// Node.js dependencies
const Guid = require("guid");
const parseuri = require("parseuri");
const phantom = require("phantom");
const fs = require("fs");
const AWS = require("aws-sdk");
var S3 = new AWS.S3();

// module/container variables
var phantomCreatePromise = null;
var phantomInstance = null;
var containerId = Date.now().toString().slice(-6); // Any unique-ish id will do.
var configTimestamp = new Date().toISOString();
let phantomExitPromise = null;

// functions

const validateArguments = function (event) {
  let err = null;
  let queryStringParameters = event[queryStringPropName];
  if (!queryStringParameters) {
    err = "event does not contain: " + queryStringPropName;
  } else if (!queryStringParameters.hasOwnProperty(urlQsName)) {
    err = "(page) '" + urlQsName + "' was not provided (in query string)";
  } else if (!queryStringParameters.hasOwnProperty(bucketQsName)) {
    err = "'" + bucketQsName + "' (name) was not provided (in query string)"
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

  page.property("paperSize", {
    //viewportSize: { width: 960, height: 1200 },
    //zoomFactor: .1,
      width: '8.5in',
      height: '11in',
      border: '50px',
      margin: '0px',
// @@@ DT: Comment out the header and footer section to stop the error: SyntaxError: Unexpected EOF
      header: {
        height: '10cm',
        contents: function (pageNum, numPages) {
          return '<div style="text-align: right; font-size: 12px;"> Check out this header with page numbers: ' + pageNum + ' / ' + numPages + '</div>';
        }
      }
/*
      ,footer: {
          height: '10cm',
          contents: function (pageNum, numPages) {
              return '<div style="text-align: right; font-size: 12px;"> Check out this footer with page numbers: ' + pageNum + ' / ' + numPages + '</div>';
          }
      }
*/
  });

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
//    console.log('page.onResourceRequested ...'); // http://phantomjs.org/api/webpage/handler/on-resource-requested.html
/*
    for (var key in requestData) {
      console.log('Key: ' + key + ', Value: ' + requestData[key]);
    }
*/
  });

  page.on('onResourceReceived', function(response) {
    // This 'stage' check can be removed if you want to view
    // more info about the chunks of the response as it is received.
    if (response.stage === 'end') {
//      console.log('page.onResourceReceived ...'); // http://phantomjs.org/api/webpage/handler/on-resource-received.html
/*
      for (var key in response) {
        console.log('Key: ' + key + ', Value: ' + response[key]);
      }

      for (var key in response.headers) {
        console.log(response.headers[key]);
      }
*/
    }
  });

  page.on('onResourceError', function(requestError) {
    console.log('page.onResourceError ...'); // http://phantomjs.org/api/webpage/handler/on-resource-error.html
    /*
    for (var key in requestError) {
      console.log('Key: ' + key + ', Value: ' + requestError[key]);
    }
    */
  });

  if (sessionId) {
    var cookie = createSessionCookie(decodedUrl, sessionId);
    console.log("adding cookie '%s' to page.", cookie);
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
  console.log("creating upload request for file: '%s' to bucket/key: '%s'/'%s'", filePath,bucketName, keyName);
  let awsRequest = null;
  if (!filePath) {
    return new Error("getUploadRequest: No file path");
  } else if (!bucketName) {
    return new Error("getUploadRequest: No S3 bucket name");
  } else if (!keyName) {
    return new Error("getUploadRequest: No S3 key name");
  }
  let uploadFile = fs.createReadStream(filePath);
  let params = {
    Bucket: bucketName,
    Key: keyName,
    ContentType: uploadFile.type,
    Body: uploadFile,
    ACL: 'public-read'
  };
  console.log("S3: " + S3);
  console.log("params: " + JSON.stringify(params));
  awsRequest = S3.putObject(params);
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
  if (awsRequest instanceof Error)
  {
    let error = awsRequest;
      console.error("Failed to create upload request: " + error);
      callback(error);
      return Promise.reject(error);
  }
  else {
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
  }
};

const phantomExitHandler = function(error, callback) {
  if (error) {
    console.error("Got phantom error: " + error);
  }
  if (phantomInstance && !phantomExitPromise) {
    console.log("Shutting down phantom instance...");
    phantomExitPromise = phantomInstance.exit();
    phantomExitPromise.then(function () {
      phantomInstance = null;
      phantomExitPromise = null;
      console.error("Finished shutting down phantom instance.");
      if (callback)
      {
        callback(error);
      }
    });
  }
};

const createAndProcessPage = function (decodedUrl, bucketName, sessionId, handlerFinishedCallback) {

  const phantomErrorHandler = function (error) {
    // @@@ DT: If this is called (for page.on("onError"), I want the handlerFinishedCallback to be called (once eventually) and the promise chain to stop!
    phantomExitHandler(error, handlerFinishedCallback);
/*
    // @@@ DT: How do I break the promise chain?
    if (error) {
      throw new Error(error);
    }
*/
  };

  let phantomPage = null;
  let fileName = null;
  let filePath = null;

  console.log("Creating page...");
  const stepErrorHandler = function(errMsg) {
    let error = new Error(errMsg);
    console.error(error);
    handlerFinishedCallback(null, error);
    throw error;
  }
  phantomInstance.createPage().
    then( function (webpage) {
      console.log("Page created (successfully).");
      phantomPage = webpage;
      setupPage(webpage, decodedUrl, sessionId, phantomErrorHandler);
      console.log("Using page to open URL: " + decodedUrl);
      let pageOpenPromise = phantomPage.open(decodedUrl);
      return pageOpenPromise;
    }).
    then( function () {
      fileName = getNewFileName(pdfExtension);
      filePath = getTempFilePath(fileName);
      console.log("Rendering opened page to file: %s", filePath);
      let pageRenderPromise = null;
      try {
        pageRenderPromise = phantomPage.render(filePath);
      }
      catch (err)
      {
        console.error("Got error while rendering page: " + error);
        pageRenderPromise = Promise.reject(err);
      }
      return pageRenderPromise;
    }).
    then( function () {
      let keyName = fileName;
      // @@@ DT: Ideally, this section should not happen if the previous section gets an error.
      console.log("Preparing to upload file: '%s' to bucket: %s under key: %s", filePath, bucketName, keyName);
/*
//      @@@ DT: I am temporarily commenting out this section to upload the file so you can play with this w/o actually uploading (since you need an AWS account).
      // Please note that I am not currently using the Promise version of AWS SDK but using AWS.Request objects instead.
      // Perhaps I should change this approach to be consistent!
      let uploadResult = uploadRenderedPageToS3(filePath, bucketName, keyName, handlerFinishedCallback);
      if (uploadResult && uploadResult instanceof Promise)
      {
        return uploadResult;
      }
*/
    }, handlerFinishedCallback).
    catch( handlerFinishedCallback);
};

const processRequest = function(args, handlerFinishedCallback) {
  console.log("processRequest was called with: " + args);

    let encodedUrlOfPageToPrint = args[urlPropName];
    let decodedUrlOfPageToPrint = decodeURIComponent(encodedUrlOfPageToPrint);
    let bucketName = args[bucketPropName];
    let sessionId = args[sessionIdPropName];

    const capturePhantomInstance = function(instance) {
      if (phantomInstance) {
        console.warn("Already captured phantom instance!");
      } else {
        console.log("Phantom instance created: " + instance);
        phantomInstance = instance;
      }
      createAndProcessPage(decodedUrlOfPageToPrint, bucketName, sessionId, handlerFinishedCallback);
    };

    // create phantomInstance object if it doesn't already exist (once per container)
    if (phantomInstance) {
      console.log("Container %s reusing phantom instance created at: %s", containerId, configTimestamp);
      createAndProcessPage(decodedUrlOfPageToPrint, bucketName, sessionId, handlerFinishedCallback);
    } else {
      if (!phantomCreatePromise) {
        console.log("Container %s creating new phantom instance at: %s", containerId, configTimestamp);
        let phantomArgs = [];
        let phantomOptions =  {
//            logLevel: "debug"
          };
        phantomCreatePromise = phantom.create(phantomArgs,phantomOptions);
        phantomCreatePromise.then(capturePhantomInstance).
        catch(handlerFinishedCallback);
      }
    }
};

exports.handler = (event, context, handlerFinishedCallback) => {
  let argsError = validateArguments(event);
  if (argsError) {
    handlerFinishedCallback(argsError);
  } else {
    let queryStringParams = event[queryStringPropName];

    const getQueryStringArgs = function (queryStringParams) {
        let args = {};
        args[urlPropName] = queryStringParams[urlQsName]
        args[bucketPropName] = queryStringParams[bucketQsName];
        args[sessionIdPropName] = queryStringParams[sessionIdQsName];
        return args;
    };
    let args = getQueryStringArgs(queryStringParams);
    processRequest(args,handlerFinishedCallback);
  }
};


const getProcessArgs = function () {
    let args = {};
    let argv = process.argv;
    let numArgs = argv.length;
    console.log("Processing args: " + JSON.stringify(argv));
    if (numArgs < 6) {
      console.error("Not enough args: %d", numArgs);
    } else {
      args[urlPropName] = argv[2];
      args[bucketPropName]= argv[3];
      args[accessKeyIdPropName]= argv[4];
      args[secretAccessKeyPropName] = argv[5];
      if (numArgs >= 7)
      {
        args[sessionIdPropName] = argv[6];
      }
    }
    return args;
};

const commandLineFinishedCallback = function (error,result) {
  console.log("Called commandLineFinishedCallback: ('%s',%s)", error,result);
  phantomExitHandler();
};

let args = getProcessArgs();
if (args.accessKeyId && args.secretAccessKey)
{
  console.log("Setting up default credentials to AWS");
  let credentials = new AWS.Credentials({accessKeyId: args.accessKeyId, secretAccessKey: args.secretAccessKey});
  AWS.config.credentials = credentials;
  delete args.accessKeyId;
  delete args.secretAccessKey;
  S3 = new AWS.S3();
}
processRequest(args, commandLineFinishedCallback);
