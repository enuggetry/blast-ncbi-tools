#!/usr/bin/env node

/* 
 * (this script gets copied to the app root directory upon npm install)
 */
var appPath = require("app-root-path").path;
var fs = require("fs-extra");
var shelljs = require("shelljs");
var getopt = require('node-getopt');
var toAbsolutePath = require('to-absolute-path');

var thisPath = appPath; //process.cwd();


// check if jbrowse is a module
if (fs.existsSync(thisPath+"/node_modules/blastjs")) {
    thisPath = thisPath+"/node_modules/blastjs";
    shelljs.cd(thisPath);
}

thisPath += "/bin/";

var options = [
    ['','config', 'display merged config']
];

// help
options = options.concat([
    ['h','help', 'display this help']
]);

var getopts = new getopt(options);

getopts.bindHelp();     // bind option 'help' to default action
var opt = getopts.parseSystem(); // parse command line


//shelljs.ln("ln -s /path/to/file /path/to/symlink")

if (typeof opt.argv[0] !== 'undefined') {
    //console.log("parameter",opt.argv[0]);
    var abspath = toAbsolutePath(opt.argv[0]);
    //console.log("abspath",abspath);
    if (fs.existsSync(abspath)) {
        console.log("ln -s "+abspath+" "+thisPath);
		fs.ensureDirSync(thisPath);
		thisPath += 'ncbi-blast+';
        shelljs.ln('-s',abspath,thisPath);
        console.log("NCBI Blast+ lined to ",thisPath);
    }
    else {
        console.log("invalid path");
    }
    
}
else
    console.log("no parameters");
