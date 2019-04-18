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

setupExit();

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

console.log("NCBI Blast+ path",binPath);

function setupExit() {

	process.stdin.resume();//so the program will not close instantly

	function exitHandler(options, exitCode) {
		//if (options.cleanup) console.log('clean');
		if (exitCode || exitCode === 0) console.log('blast_getBlastUtils exit code',exitCode);
		if (options.exit) {
			process.exit(exitCode);
		}
	}

	//do something when app is closing
	process.on('exit', exitHandler.bind(null,{cleanup:true}));

	//catches ctrl+c event
	process.on('SIGINT', exitHandler.bind(null, {exit:true}));

	// catches "kill pid" (for example: nodemon restart)
	process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
	process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

	//catches uncaught exceptions
	process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
}