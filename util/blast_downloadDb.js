#!/usr/bin/env node

var JSFtp = require("jsftp");
var getopt = require('node-getopt');
var path = require('path');
var shell = require('shelljs');
var approot = require('app-root-path');
var fs = require("fs-extra");
var async = require("async");

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
        
        var filelist = [];
 
        // eliminate files with .md5 extentions
        for(var i in res) {
            if (res[i].name.indexOf('.md5') === -1) filelist.push(res[i]);
        }

        // ensure target directory
        var blastDbPath = approot+'/blastdb/'+search+'/';
        fs.ensureDirSync(blastDbPath);
        
        // determine if this is a partial dataset (ie. "htgs.05" instead of "htgs")
        var nalFile = false;
        if (search.indexOf('.') !== -1) {
            var sp = search.split('.');
            if (sp[0].length && sp[1].length) nalFile = blastDbPath+sp[0]+'.nal';
        }
        
        async.eachSeries(filelist, function(file, cb) {

            console.log('Processing file ' + file.name);
            download(file,blastDbPath, cb);

        }, function(err) {
            if( err ) {
                console.log('A file failed to process');
            } else {
                console.log('All files have been processed successfully');
              
                if (nalFile) fixNalFile(nalFile,search);
            }
        });        
        
        function download(file,blastDbPath,cb) {

            //return cb();
            var outPath = blastDbPath+path.basename(file.name);

            console.log('retriving',file.name,outPath);
            var totalSize = parseInt(file.size);
            var totalSizeMb = (totalSize / 1000000.0).toFixed(2);

            // create empty outPath file
            fs.writeFileSync(outPath,"");

            // setup interval timer to monitor progress.
            var timer = setInterval(function() {
                var stats = fs.statSync(outPath);
                var sizeMb = (stats.size / 1000000.0).toFixed(2);
                process.stdout.write('Downloading: '+sizeMb+'/'+totalSizeMb+"MB     \r");
            },2000);

            // do the ftp get operation
            ftp.get(file.name, outPath, function(err) {
                clearInterval(timer);
                if (err) {
                    console.log("failed to get",file.name,err);
                    //process.exit(1);
                    cb(err);
                }
                console.log('extracting',outPath);
                shell.exec(	'tar xvzf '+outPath+' -C '+blastDbPath);
                fs.unlink(outPath);                 // delete the tar file
                console.log('Blast DB now installed in',blastDbPath);
                //process.exit(0);
                cb();
            });
        }
        function fixNalFile(file,dbName) {
            console.log('fixing .nal file',file,dbName);
            
            var content = fs.readFileSync(file,'utf-8');
            
            var lines = content.split("\n");
            
            for(var i in lines) {
                if (lines[i].indexOf('DBLIST') !== -1) {
                    lines[i] = 'DBLIST "'+dbName+'"';
                }
            }
            var newContent = lines.join("\n");
            
            fs.writeFileSync(file,newContent+"\n");
            //console.log(newContent);

            
        }
    });
}

