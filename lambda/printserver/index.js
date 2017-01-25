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
const pageRenderTimeout = 5000;

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
  const queryStringParameters = event[queryStringPropName];
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
  console.log("Setting up a phantom page (callbacks and paperSize)...")
  const page = webpage;

  page.property("paperSize", {
    //viewportSize: { width: 960, height: 1200 },
    //zoomFactor: .1,
      width: '8.5in',
      height: '11in',
      border: '50px',
      margin: '0px',
// @@@ DT: Comment out the header and footer section to stop the error: SyntaxError: Unexpected EOF
/*
      header: {
        height: '10cm',
        contents: function (pageNum, numPages) {
          return '<div style="text-align: right; font-size: 12px;"> Check out this header with page numbers: ' + pageNum + ' / ' + numPages + '</div>';
        }
      }

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
    console.log("Adding cookie '%s' to page.", JSON.stringify(cookie));
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
  const filePath = tmpDir + pathSeparator + fileName;
  return filePath;
};

const getUploadPromise = function (filePath, bucketName, keyName) {
  let promiseResult = null;
  if (!filePath) {
    promiseResult = Promise.reject(new Error("getUploadPromise: No file path"));
  } else if (!bucketName) {
    promiseResult = Promise.reject(new Error("getUploadPromise: No S3 bucket name"));
  } else if (!keyName) {
    promiseResult = Promise.reject(new Error("getUploadPromise: No S3 key name"));
  }
  else {
    console.log("Creating upload request for file: '%s' to bucket/key: '%s'/'%s'", filePath,bucketName, keyName);
    let uploadFile = fs.createReadStream(filePath);
    const params = {
      Bucket: bucketName,
      Key: keyName,
      ContentType: uploadFile.type,
      Body: uploadFile,
      ACL: 'public-read'
    };
    //console.log("S3: " + S3);
    //console.log("params: " + JSON.stringify(params));
    const awsRequest = S3.putObject(params);
    promiseResult = awsRequest.promise();
  }
  return promiseResult;
};

const getSignedUrlPromise = function (bucketName, keyName) {
  const expirationSeconds = 900; // 15 minutes (900 seconds)- the default
  const operation = "getObject";
  const params = {Bucket: bucketName, Key: keyName, Expires: expirationSeconds};
  console.log("Getting signed URL for: '" + operation + "' with: " + JSON.stringify(params));
  const promise = new Promise(function(resolve, reject) {
    S3.getSignedUrl(operation, params, function(err, data) {
        if (err) {
            console.log("getSignedUrl will be rejected with err: " + JSON.stringify(err));
            reject(err);
        } else {
            console.log("getSignedUrl will be fulfilled with data: " + JSON.stringify(data));
            resolve(data);
        }
    });
  });
  return promise;
};

const phantomExitHandler = function(error, result, callback) {
  if (phantomInstance && !phantomExitPromise) {
    console.log("Shutting down phantom instance...");
    phantomExitPromise = phantomInstance.exit();

    const finishedExitingPhantom = function () {
      phantomInstance = null;
      phantomExitPromise = null;
      console.log("Finished shutting down phantom instance.");
      if (callback && typeof callback === "function")
      {
        let fnName = callback.name;
        console.log("Calling phantom exit callback with name: " + fnName);
        callback(error,result);
      }
    };

    console.log("Phantom exit promise: " + JSON.stringify(phantomExitPromise));
    if (!phantomExitPromise) {
      finishedExitingPhantom();
    } else {
      phantomExitPromise.then(finishedExitingPhantom);
    };
  }
};

const createAndProcessPage = function (decodedUrl, bucketName, sessionId, handlerFinishedCallback) {
  const phantomErrorHandler = function (error) {
    if (error) {
      console.error("Got phantom error: " + error);
    }
    phantomExitHandler(error, null, function () {
      throw error;
    });
  };

  let phantomPage = null;
  let fileName = null;
  let filePath = null;

  // @@@ DT: Below is the sequence of operations.
  console.log("Creating phantom page...");
  let createPagePromise = phantomInstance.createPage();
  // console.log("Create page promise: " + JSON.stringify(createPagePromise));
  createPagePromise.then( function (webpage) {
      console.log("Page created (successfully).");
      phantomPage = webpage;
      setupPage(webpage, decodedUrl, sessionId, phantomErrorHandler);
      console.log("Using page to open URL: " + decodedUrl);
      let openPromise = phantomPage.open(decodedUrl);
      // console.log("Page open (url) promise: " + JSON.stringify(openPromise));
      return openPromise;
    }).
    then( function () {
      fileName = getNewFileName(pdfExtension);
      filePath = getTempFilePath(fileName);
      console.log("Rendering opened page to file: %s", filePath);
      let timeoutPromise = new Promise( function (resolve,reject) {
        setTimeout( function () {
          let pageRenderPromise = phantomPage.render(filePath);
          pageRenderPromise.then(resolve);
        }, pageRenderTimeout);
      });
      // console.log("Page render promise: " + JSON.stringify(timeoutPromise));
      return timeoutPromise;
    }).
    then( function () {
      let closePromise = phantomPage.close();
      // console.log("Page close promise: " + JSON.stringify(closePromise));
      return closePromise;
    }).
    then( function () {
      // @@@ DT: Ideally, this section should not happen if the previous section gets an error.
      console.log("Preparing to upload file: '%s' to bucket: %s under key: %s", filePath, bucketName, fileName);
      let uploadPromise = null;
      // @@@ DT: Uncomment the following line and comment out the subsequent line to disable use of AWS for testing.
      //      uploadPromise = Promise.reject(filePath);
      uploadPromise = getUploadPromise(filePath, bucketName, fileName);
      // console.log("Page upload promise: " + JSON.stringify(uploadPromise));
      return uploadPromise;
    }).
    then( function () {
      let signedUrlPromise = getSignedUrlPromise(bucketName, fileName);
      // console.log("Signed URL promise: " + JSON.stringify(signedUrlPromise));
      return signedUrlPromise;
    }).
    then ( function (result) {
      console.log("In final then handler with result: " + JSON.stringify(result));
      phantomExitHandler(null, result, handlerFinishedCallback);
    }).
    catch( function (error) {
      console.log("In final catch handler with error: " + JSON.stringify(error));
      phantomExitHandler(error, null, handlerFinishedCallback);
    });
};

const processRequest = function(args, handlerFinishedCallback) {
  console.log("processRequest was called with: " + JSON.stringify(args));

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
    let qsArgs = getQueryStringArgs(queryStringParams);
    processRequest(qsArgs,handlerFinishedCallback);
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
  console.log("Called commandLineFinishedCallback: ('%s',%s)", JSON.stringify(error),JSON.stringify(result));
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
  S3 = new AWS.S3();
}
processRequest(args, commandLineFinishedCallback);
*/
