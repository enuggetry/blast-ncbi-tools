var appPath = require("app-root-path").path;
var shelljs = require("shelljs");
var modPath = ""+shelljs.pwd();
var fs = require('fs-extra');

console.log("blastjs postinstall",modPath);

// copy blast_* utils to the app directory.
var src = modPath+"/util/blast_*";
var trg = appPath+"/utils";

try {
    // if dir doesn't exist, create it
    fs.ensureDirSync(trg);
    
    //copy scripts to approot
    shelljs.cp(src,trg);
}
catch(err) {
    console.log('failed to create',trg);
    process.exit(1);
}

console.log("blastjs postinstall done");
