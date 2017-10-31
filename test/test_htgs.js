var assert = require("assert");
var fs = require('fs-extra');



var blast = require('../index.js');
var appPath = require("app-root-path").path;

blast.outputString(true); //optional, provides string output instead of JSON

var dbPath = '/var/www/html/blastdb/htgs/13apr2014/htgs';

var options = {
        db: dbPath,
        outfmt: 5,
        outputDirectory: appPath+'/tmp',
        queryFile: './test/700hits.fa',
        outFileExt: 'blastxml'
};

fs.ensureDir(options.outputDirectory);

//read the file that the result will be compared against.
var buffer = fs.readFileSync('./test/blastresult.xml');

blast.blast(options, function(err, results) {
    assert.equal(err, null);
    assert(results.match(buffer));     
});




