#!/usr/bin/env node

/* 
 * (this script gets copied to the app root directory upon npm install)
 */
var path = require('path');
var appPath = path.dirname(require.main.filename);
//var appPath = require("app-root-path").path;
var fs = require("fs-extra");
var shelljs = require("shelljs");
var getopt = require('node-getopt');
var toAbsolutePath = require('to-absolute-path');

var thisPath = appPath + '/blastbin/'; // the target path

var options = [
//    ['h','help', 'display this help']
];

// get command line options
var getopt = new getopt(options);

getopt.bindHelp();     // bind option 'help' to default action
var opt = getopt.parseSystem(); // parse command line

var helpTxt = 
    "Creates a symlink reference to existing NCBI tools into approot/blastbin directory\n\n"+
    "Usage: node blast_setPathUtils.js <source path of blast+ tools>\n" +
    //"[[OPTIONS]]\n" +
    "";

getopt.setHelp(helpTxt);

/* Display help if no arguments are passed */
if (!process.argv.slice(2).length) {
	getopt.showHelp();
	process.exit(1);
}

// check parameter is there
if (typeof opt.argv[0] !== 'undefined') {
    var abspath = toAbsolutePath(opt.argv[0]);
	
	// parameter path exists?
    if (fs.existsSync(abspath)) {
        // create the target dir if necessary
        fs.ensureDirSync(thisPath);

        var pathbase = path.basename(abspath);
        thisPath += pathbase;
        //console.log("ln -s "+abspath+" "+thisPath);
		
        // create the symlink
        shelljs.ln('-s',abspath,thisPath);
        console.log("NCBI Blast+ symlink at:",thisPath);
    }
    else {
        console.log("invalid path");
    }
}
else
    console.log("no parameters");
