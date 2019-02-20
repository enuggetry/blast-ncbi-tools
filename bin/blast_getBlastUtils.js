#!/usr/bin/env node

/* Installs NCBI blast utilities.
 * Determines appropriate directory where jbrowse is installed (app root or as a module in node_modules).
 * Then runs setup.sh
 * (this script gets copied to the app root directory upon npm install)
 * 
 * Usage: blast_getBlastUtils.js <version>
 * Version is optional.  If not specified, latest is pulled.
 * Example: ./utils/blast_getBlastUtils.js 2.8.1
 */

var fs = require("fs-extra");
var shelljs = require("shelljs");
var finder = require('fs-finder');
var path = require('path');
//var appPath = path.dirname(require.main.filename);
var appPath = require("app-root-path").path;

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
var checkPath = appPath+"/node_modules/blast-ncbi-tools";
console.log("appPath,checkPath",appPath,checkPath);

if (process.argv.length > 2)
	console.dir(process.argv[2]);

if (fs.existsSync(checkPath+"/bin/getBlast.js")) {
    shelljs.cd(checkPath);
}
console.log("cwd",process.cwd());

if (process.argv.length > 2) 
	shelljs.exec("node ./bin/getBlast.js "+process.argv[2]);
else
	shelljs.exec("node ./bin/getBlast.js");

shelljs.exec("node ./bin/getBlast.js");

console.log("NCBI Blast+ path",binPath);
