var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var _ = require('lodash');
var uuid = require('uuid');
var parseString = require('xml2js').parseString;
var appPath = require("app-root-path").path;

var runFrom = appPath + '/blastbin';

var blast = {
  stringOutput: false,
  customBlastLocation: null
};

_.attempt(lookupCustomBlastLocation);

function lookupCustomBlastLocation() {
  var lookDir = runFrom; 
  var binStats;
  var binFiles;
  var pathToFirst;
  var innerBin;
  var innerBinStats;

  binStats = fs.lstatSync(lookDir);
  if (binStats.isDirectory()) {
    binFiles = fs.readdirSync(lookDir);
    if (binFiles.length) {
      pathToFirst = path.join(lookDir, binFiles[0]);
      innerBin = path.join(pathToFirst, 'bin');
      innerBinStats = fs.lstatSync(innerBin);
      if (innerBinStats.isDirectory()) {
        blast.customBlastLocation = innerBin;
      }
    }
  }

}

blast.outputString = function(bool) {
  blast.stringOutput = !!(!bool || bool === true);
};

blast.blastN = function(db, query, cb) {
  blaster('blastn', db, query, cb);
};

blast.blastP = function(db, query, cb) {
  blaster('blastp', db, query, cb);
};

blast.blastX = function(db, query, cb) {
  blaster('blastx', db, query, cb);
};

blast.tblastN = function(db, query, cb) {
  blaster('tblastn', db, query, cb);
};

blast.tblastX = function(db, query, cb) {
  blaster('tblastx', db, query, cb);
};

blast.blast = function(options, cb) {
    var nonBlastOptions = ['type', 'outputDirectory', 'rawOutput','queryFile','outFileExt','returnParams'];
    var optArr = [];
    var guid = uuid.v1();
    var queryString;
    var opts = {
      type: 'blastn',
      outputDirectory: '/tmp',
      rawOutput: false,
      db: 'nt',
      outfmt: 5
    };

    // determine database, if no punctuation we are dealing with a database
    // that is in approot/blastdb/<dbname>
    var dbname = options.db;
    var dbpath = dbname;
    var rgx = /[\/.]/;  

    console.log("dbpath",dbpath,dbname);


    // if it doesnt contain puntuation "." and "/" ...
    if (!rgx.test(dbname)) {
        console.log('if it doesnt contain puntuation');
        var db = appPath+'/blastdb/'+dbname+'/'+dbname;
        dbpath = db;  //appPath+'/blastdb/'+dbname;
        options.db = db;
    }     

    // check existance of db path

    console.log("dbpath",dbpath);

    if (!fs.existsSync(dbpath+'.nhr') && !fs.existsSync(dbpath+'.nal')) {
        return cb(new Error('database does not exist: '+dbpath));
    }

    _.extend(opts, options);

    if (typeof opts.query !== 'undefined') {
        queryString = opts.query;

        if (!queryString) {
          return cb(new Error('Query must be supplied.'));
        }
        
        opts.query = path.join(opts.outputDirectory, guid + '.fasta');
    }
    var outFileExt = '.out';
    
    if (typeof opts.outFileExt !== 'undefined')
        outFileExt = '.'+opts.outFileExt;

    opts.out = path.join(opts.outputDirectory, guid + outFileExt);

    if(opts.remote) {
      opts.remote = '';
    }

    // turn all options into command line options, eliminating non-blast options
    _.each(opts, function(value, key) {
      if(nonBlastOptions.indexOf(key) > -1){
        return;
      }

      optArr.push('-' + key);
      optArr.push(value);
    });

    if (typeof opts.query !== 'undefined') {
      fs.writeFile(opts.query, queryString, function(err) {
        if (err) {
          return cb(err);
        }

        do_run(opts,optArr);
      });
    }
    else if (typeof opts.queryFile !== 'undefined') {
        optArr.push('-query');
        optArr.push(opts.queryFile);
        do_run(opts,optArr);
    }
    else {
        console.log("query or queryFile not defined.");
    }
    function do_run (opts,optArr) {
        run(opts.type + ' ' + optArr.join(' '), function(err, stdOut, stdError) {
          postBlast(err, stdOut, stdError, opts, cb);
        });
    }
};

function postBlast(err, stdOut, stdError, options, cb) {
  var outFile = options.out;
  var isRaw = options.rawOutput || blast.stringOutput || !options.outfmt.toString().match(/^(.)?5/);

    //console.log ('postBlast options',options);

  if (err) {
    return cb(err);
  }

  fs.readFile(outFile, 'utf8', function(err, data) {
    if (typeof options.returnParams !== 'undefined' && options.returnParams === true) {
        return cb(null,options);
    }
    if(isRaw){
      return cb(null, data);
    }

    parseString(data, function(err, result) {
      return cb(null, result);
    });
  });
}

function blaster(type, db, query, cb) {
  var pathW = '/tmp/' + Date.now() + '.fasta';
  fs.writeFileSync(pathW, query);

  var outPath = '/tmp/';
  var outFile = outPath + uuid.v1() + '.out';
  var blastCommand = type + ' -query ' + pathW + ' -out ' + outFile + ' -db ' + db;

  if (!blast.stringOutput) {
    blastCommand += ' -outfmt 5';
  }

  run(blastCommand, function(err, stdOut, stdError) {
    postBlast(err, stdOut, stdError, {out: outFile, outfmt: 5}, cb);
  });
}

function run(toRun, cb) {
  if (blast.customBlastLocation) {
    toRun = path.join(blast.customBlastLocation, toRun);
  }

  console.log('Blast Command: ', toRun);
  exec(toRun, cb);
}

blast.makeDB = function(type, fileIn, outPath, name, cb) {

  if (!type) {
    return cb(new Error('no type supplied'));
  }
  if (!fileIn) {
    return cb(new Error('no file supplied'));
  }
  if (!outPath) {
    return cb(new Error('no output path supplied'));
  }

  var fileNamePartOne = fileIn.replace(/^.*[\\\/]/, '');// remove directories from path
  var filename = fileNamePartOne.substr(0, fileNamePartOne.lastIndexOf('.')); //remove file extensions

  if (outPath.slice(-1) !== '/') {
    outPath = outPath + '/'; // add / out path is one is not supplied
  }

  var fileOut = outPath + filename;

  var makeCommand = 'makeblastdb -in ' + fileIn + ' -dbtype ' + type + ' -out ' + fileOut + ' -title ' + name;
  run(makeCommand, function(err, stdOut, stdErr) {
    return cb(err, stdOut, stdErr, fileOut);
  });

};

module.exports = blast;
