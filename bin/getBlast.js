/*
 * Usage: getBlast.js <version>
 * Version is optional.  If not specified, latest is pulled.
 * Example: ./utils/getBlast.js 2.8.1
 *
 */
var OS = require('os');
var Download = require('download');
var Client = require('ftp');
var fs = require('fs');
var targz = require('tar.gz');
var path = require('path');
var sh = require('shelljs');
//var appPath = path.dirname(require.main.filename);
var appPath = require("app-root-path").path;

var downloadTo = appPath + '/blastbin';

var tt = 'ftp.ncbi.nlm.nih.gov';
var address = '/blast/executables/blast+/LATEST/';
var version = '';

// handle first argument as the version number of blast to pull
console.dir(argv);

if (process.argv.length > 2) {
  console.log("version to pull:",process.argv[2]);
  address = '/blast/executables/blast+/'+process.argv[2]+'/';
  version = process.argv[2];
}
var platform = OS.platform();
var arch = OS.arch();

if(platform === 'win32') {
  platform = 'win64';
}

if (platform === 'darwin') {
  platform = 'macosx';
  arch = 'x64';
}

var foundIt = false;
var fileName = '';

console.log('looking for', platform, arch, address,'...');

// workaround for travis error; if version is included, use wget.
if (process.argv.length > 2) {
  let cmd = "wget https://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/"+version+"/ncbi-blast-"+version+"+-x64-linux.tar.gz -P "+downloadTo;

  console.log(cmd);
  sh.exec(cmd);
  //fileName = 'ncbi-blast-2.8.1+-x64-linux.tar.gz';
  extractIt();
}

else {
  console.log("xxxxxxxxx what the...");
  var c = new Client();
  c.on('ready', function () {
    c.list(address, function (err, list) {
      if (err) throw err;
      console.dir("list",list);


      list.forEach(function (l) {
        if (l.name.indexOf(platform) > -1) {
          if (l.name.indexOf(arch) > -1) {
            if (l.name.indexOf('md5') === -1) {
              foundIt = true;
              fileName = l.name;
            }
          }
        }
      });
      if (!foundIt) {
        console.error('we could not find the correct version of blast+ for you, sorry');
      } else {

        var finalURL = tt + address + fileName;
        downloadIt(finalURL);
      }
      c.end();
    });
  });
  c.connect({host: tt});
}

function downloadIt(url) {
  console.log('Downloading', url, downloadTo, '...');
  new Download({mode: '755'})
    .get('http://' + url) //have to add http to url
    .dest(downloadTo)
    .run(extractIt);
}

function extractIt(err){
  if(err) throw err;

  console.log('Extracting file', downloadTo+'/' + fileName);
  targz().extract(downloadTo + '/' + fileName, downloadTo+'/', deleteIt);
}

function deleteIt(err){
  if(err) throw err;
  
  console.log('Cleaning up ...');
  fs.unlinkSync(downloadTo + '/' + fileName);
}
