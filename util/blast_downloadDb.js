#!/usr/bin/env node

var JSFtp = require("jsftp");
var getopt = require('node-getopt');
var path = require('path');
var shell = require('shelljs');
var approot = require('app-root-path');
var fs = require("fs-extra");

// local options
var options = [
    ['h','help', 'display this help']
];

var getopt = new getopt(options);

getopt.bindHelp();     // bind option 'help' to default action
opt = getopt.parseSystem(); // parse command line

var helpTxt = 
    "\nRetrieve and install Blast DB from  ftp://ftp.ncbi.nlm.nih.gov/blast/db/ into approot/blastdb\n"+
    "Usage: node downloadDb.js <database name> (i.e. 'htgs' or 'htgs.05'\n\n"+
    "Example: node downloadDb.js htgs (retrieves htgs database)\n" +
    "(Since databases may be large, this could take a while.)\n\n"+
    "[[OPTIONS]]\n" +
    "\n";

getopt.setHelp(helpTxt);


/* Display help if no arguments are passed */
if (!process.argv.slice(2).length) {
	getopt.showHelp();
	process.exit(1);
}

if (typeof opt.argv[0] !== 'undefined') {

    var blastDbPath = '/blast/db/';
    var search = opt.argv[0];

    var ftp = new JSFtp({
      host: "ftp.ncbi.nlm.nih.gov"
    });

    ftp.ls(blastDbPath+search+'*.tar.gz*', function(err, res) {
        res.forEach(file => {
            if (file.name.indexOf('.md5') === -1) {
                
                var blastDbPath = approot+'/blastdb/'+path.basename(file.name,'.tar.gz')+'/';
                
                fs.ensureDirSync(blastDbPath);
                
                var outPath = blastDbPath+path.basename(file.name);
                
                console.log('retriving',file.name,outPath);
                
                
                ftp.get(file.name, outPath, function(err) {
                    if (err) {
                        console.log("failed to get",file.name,err);
                        process.exit(1);
                    }
                    console.log('extracting',outPath);
                    shell.exec(	'tar xvzf '+outPath+' -C '+blastDbPath);
                    fs.unlink(outPath);                 // delete the tar file
                    console.log('Blast DB now installed in',blastDbPath);
                    process.exit(0);
                });
            }
        });
    });
}
