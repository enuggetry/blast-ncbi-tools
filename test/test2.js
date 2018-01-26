var assert = require("assert");
var fs = require('fs-extra');



describe('blastjs', function () {
  this.timeout(15000);
  describe('#blast', function () {
    it('blastn XML result test', function(done){
        this.timeout(90000); //Calling remote can take a little while.
        //console.log('Querying remote database...');
        var blast = require('../lib/blast.js');
        var appPath = require("app-root-path").path;
        //var blast = require('blastjs');
        
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

        var buffer = fs.readFileSync('./test/blastresult.xml');

        blast.blast(options, function(err, results) {
            assert.equal(err, null);
            assert(results.match(buffer));     
            done();
        });
    });
  });
});




