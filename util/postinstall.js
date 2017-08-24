var appPath = require("app-root-path").path;
var shelljs = require("shelljs");
var modPath = ""+shelljs.pwd();

console.log("blastjs postinstall",modPath);

// copy blast_* utils to the app directory.
var src = modPath+"/util/blast_*";
var trg = appPath;

//copy scripts to approot
shelljs.cp(src,trg);

//console.log("blast postinstall done");
