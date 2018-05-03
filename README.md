# blast-ncbi-tools
[![Build Status](https://travis-ci.org/TeamMacLean/blastjs.svg?branch=master)](https://travis-ci.org/TeamMacLean/blastjs)
>a BLAST+ wrapper for Node.js (modified to support jblast)

This project is based on https://www.npmjs.com/package/blastjs, however it has diverged
to support jbconnect-hook-jblast

## Install

```bash
npm install enuggetry/blast-ncbi-tools
```
Install NCBI blast+ tools:    
```bash
./utils/blast_getBlastUtils.js
```
The latest version of Blast+ will be downloaded and placed in the bin folder for you.

## Usage

### blast n
```javascript
var blast = require('blastjs');

blast.outputString(true); //optional, provides string output instead of JSON

var dbPath = './example';
var query = '>24.6jsd2.Tut\nGGTGTTGATCATGGCTCAGGACAAACGCTGGCGGCGTGCTTAATACATGCAAGTCGAACGGGCTACCTTCGGGTAGCTAGTG'
+'\n>24.6jsd3.Tut\nATGATCATGGCTCAGATTGAACGCTGGCGGCATGCCTTACACATGCAAGTCGAACGGCAGCACGGGGAAGGGGCAACTCTTT';

blast.blastN(dbPath, query, function (err, output) {
  if(!err){
    console.log(output);
  }
});

```

## API (much of this was not specifically maintained but may still work fine)

* .makeDB(type, fileIn, outPath, name, cb)    
  callback is passed (err, stdOut, stdErr, fileOut).
  
* .blastN(db, query, cb)    
  callback is passed (err, output).
  
* .blastP(db, query, cb)    
  callback is passed (err, output).
  
* .blastX(db, query, cb)    
  callback is passed (err, output).
  
* .tblastN(db, query, cb)    
  callback is passed (err, output).
  
* .tblastX(db, query, cb)    
  callback is passed (err, output).
  
* .outputString(boolean)    
  this toggles the output being in a string (true) or as JSON (false).    
  default is JSON.
