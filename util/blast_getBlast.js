#!/usr/bin/env node

/* Determines appropriate directory where jbrowse is installed (app root or as a module in node_modules).
 * Then runs setup.sh
 * (this script gets copied to the app root directory upon npm install)
 */

var fs = require("fs-extra");
var shelljs = require("shelljs");
var finder = require('fs-finder');
var thisPath = require("app-root-path").path;

var setupScript = "getBlast.js";

// exit if already installed
var found = finder.from(thisPath).findFiles('blastn');
if (found.length > 0) {
    console.log("NCBI Blast+ already installed in",thisPath);
    process.exit(0);
}
// check if blastjs is a module
if (fs.existsSync(thisPath+"/node_modules/blastjs/util/"+setupScript)) {
    shelljs.cd('node_modules/blastjs');
    console.log('cwd',process.cwd());
}

shelljs.exec("node ./util/"+setupScript);

console.log("NCBI Blast+ path",thisPath);
