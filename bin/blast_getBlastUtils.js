#!/usr/bin/env node

/* Installs NCBI blast utilities.
 * Determines appropriate directory where jbrowse is installed (app root or as a module in node_modules).
 * Then runs setup.sh
 * (this script gets copied to the app root directory upon npm install)
 */

var fs = require("fs-extra");
var shelljs = require("shelljs");
var finder = require('fs-finder');
var appPath = require("app-root-path").path;
var modPath = ""+shelljs.pwd();

var binPath = appPath + '/blastbin';

// exit if blast+ already installed
if (fs.pathExistsSync(binPath)) {
    var found = finder.from(binPath).findFiles('blastn');
    if (found.length > 0) {
        console.log("NCBI Blast+ already installed in",binPath);
        process.exit(0);
    }
}
// check if blastjs is a module in node_modules
var checkPath = modPath;
if (fs.existsSync(checkPath+"/bin/getBlast.js")) {
    shelljs.cd(checkPath);
}
console.log("cwd",process.cwd());

shelljs.exec("node ./bin/getBlast.js");

console.log("NCBI Blast+ path",binPath);
