const index = require("./index");
const commandLineArgs = require('command-line-args');

const accessKeyIdPropName = "accessKeyId";
const secretAccessKeyPropName = "secretAccessKey";

const getProcessArgs = function () {
    let args = {};
    const optionDefinitions = [
      { name: index.urlPropName, alias: 'u', type: String, defaultOption: true },
      { name: index.sessionIdPropName, alias: 'j', type: String},
      { name: index.bucketPropName, alias: 'b', type: String, group: "aws"},
      { name: accessKeyIdPropName, alias: 'a', type: String, group: "aws"},
      { name: secretAccessKeyPropName, alias: 's', type: String, group: "aws"}
    ];
    try {
      let argv = process.argv;
      console.log("Processing raw command line args: " + JSON.stringify(process.argv));
      args = commandLineArgs(optionDefinitions);
      console.log("Parsed command line args: " + JSON.stringify(args));
      if (!args._all[index.urlPropName]) {
        console.error("Missing required option name: " + index.urlPropName);
      };
    }
    catch (error) {
      console.error("Error parsing command line arguments: " + error);
    };
    return args._all;
};

const commandLineFinishedCallback = function (error,result) {
  console.log("Called commandLineFinishedCallback: ('%s',%s)", JSON.stringify(error),JSON.stringify(result));
};

let args = getProcessArgs();
let accessKeyId = args[accessKeyIdPropName];
let secretAccessKey = args[secretAccessKeyPropName];
if (accessKeyId && secretAccessKey) {
  console.log("Setting up default credentials to AWS");
  let credentials = new index.AWS.Credentials({accessKeyId: accessKeyId, secretAccessKey: secretAccessKey});
  index.AWS.config.credentials = credentials;
  delete args[accessKeyIdPropName];
  delete args[secretAccessKeyPropName];
  index.S3 = new index.AWS.S3();
}
index.processRequest(args, commandLineFinishedCallback);
