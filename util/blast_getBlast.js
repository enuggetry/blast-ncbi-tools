#!/usr/bin/env node

/* Determines appropriate directory where jbrowse is installed (app root or as a module in node_modules).
 * Then runs setup.sh
 * (this script gets copied to the app root directory upon npm install)
 */

var fs = require("fs-extra");
var shelljs = require("shelljs");

var setupScript = "getBlast.js";
var thisPath = process.cwd();

// check if jbrowse is a module
console.log('p='+thisPath+"/node_modules/blastjs/util/"+setupScript);

if (fs.existsSync(thisPath+"/node_modules/blastjs/util/"+setupScript)) {
    shelljs.cd('node_modules/blastjs');
    console.log('cwd',process.cwd());
}

console.log("result=",shelljs.exec("node ./util/"+setupScript));

console.log("NCBI Blast+ path",thisPath);
