const index = require("./index");

const getProcessArgs = function () {
    let args = {};
    let argv = process.argv;
    let numArgs = argv.length;
    console.log("Processing args: " + JSON.stringify(argv));
    if (numArgs < 6) {
      console.error("Not enough args: %d", numArgs);
    } else {
      args[index.urlPropName] = argv[2];
      args[index.bucketPropName]= argv[3];
      args[index.accessKeyIdPropName]= argv[4];
      args[index.secretAccessKeyPropName] = argv[5];
      if (numArgs >= 7)
      {
        args[index.sessionIdPropName] = argv[6];
      }
    }
    return args;
};

const commandLineFinishedCallback = function (error,result) {
  console.log("Called commandLineFinishedCallback: ('%s',%s)", JSON.stringify(error),JSON.stringify(result));
};

let args = getProcessArgs();
if (args.accessKeyId && args.secretAccessKey)
{
  console.log("Setting up default credentials to AWS");
  let credentials = new index.AWS.Credentials({accessKeyId: args.accessKeyId, secretAccessKey: args.secretAccessKey});
  index.AWS.config.credentials = credentials;
  delete args.accessKeyId;
  delete args.secretAccessKey;
  index.S3 = new index.AWS.S3();
}
index.processRequest(args, commandLineFinishedCallback);
