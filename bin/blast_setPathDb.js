#!/usr/bin/env node

/* 
 * (this script gets copied to the app root directory upon npm install)
 */
var path = require('path');
//var appPath = path.dirname(require.main.filename);
var appPath = require("app-root-path").path;
var fs = require("fs-extra");
var shelljs = require("shelljs");
var getopt = require('node-getopt');
var toAbsolutePath = require('to-absolute-path');

var thisPath = appPath + '/blastdb'; // the target path

var options = [
//    ['h','help', 'display this help']
];

// get command line options
var getopt = new getopt(options);

getopt.bindHelp();     // bind option 'help' to default action
var opt = getopt.parseSystem(); // parse command line

var helpTxt = 
    "Creates a symlink reference to existing blast db into approot/blastdb directory\n\n"+
    "Usage: node blast_setPathDb.js <source path of blast db> <target>\n" +
    "Example: node blast_setPathDb.js /home/me/htgs/13apr08 htgs"+
    //"[[OPTIONS]]\n" +
    "";

getopt.setHelp(helpTxt);

/* Display help if no arguments are passed */
if (!process.argv.slice(2).length) {
	getopt.showHelp();
	process.exit(1);
}

// check parameter is there
if (opt.argv.length <2) {
    console.log("missing arguments");
	getopt.showHelp();
    process.exit(1);
}
if (typeof opt.argv[0] !== 'undefined') {
    console.log("argv",opt.argv);
    var abspath = toAbsolutePath(opt.argv[0]);
    var target = thisPath;
    
	// parameter path exists?
    if (fs.existsSync(abspath)) {
        // create the target dir if necessary
        fs.ensureDirSync(target);

        // create the symlink
        let symln = target+'/'+opt.argv[1];
        shelljs.exec('ln -s '+abspath+' '+symln);
        console.log("NCBI Blast+ symlink at:",symln);
    } 
    else {
        console.log("invalid path");
    }
}
else
    console.log("no parameters");
