var appPath = require("app-root-path").path;
var blast = require('../lib/blast');
var fs = require('fs-extra');

blast.outputString(true); //optional, provides string output instead of JSON

var dbPath = './test/example';
var query = '>24.6jsd2.Tut\nGGTGTTGATCATGGCTCAGGACAAACGCTGGCGGCGTGCTTAATACATGCAAGTCGAACGGGCTACCTTCGGGTAGCTAGTG'
+'\n>24.6jsd3.Tut\nATGATCATGGCTCAGATTGAACGCTGGCGGCATGCCTTACACATGCAAGTCGAACGGCAGCACGGGGAAGGGGCAACTCTTT';

var options = {
    query: query,
    db: dbPath,
    outfmt: 5,
    outputDirectory: appPath+'/tmp'
};

fs.ensureDir(options.outputDirectory);
console.log("outputDirectory",options.outputDirectory);

blast.blast(options, function (err, output) {
  if(!err){
    console.log(output);
  }
});



