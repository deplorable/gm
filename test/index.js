
// gm - Copyright Aaron Heckmann <aaron.heckmann+github@gmail.com> (MIT Licensed)

var async = require('async');
var dir = __dirname + '/../examples/imgs';
var gm = require('../');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var only = process.argv.slice(2);
gm.integration = !! ~process.argv.indexOf('--integration');
if (gm.integration) only.shift();

var files = fs.readdirSync(__dirname).filter(filter);

function filter (file) {
  if (!/\.js$/.test(file)) return false;
  if ('index.js' === file) return false;
  if (only.length && !~only.indexOf(file)) return false;

  var filename = __dirname + '/' + file;
  if (!fs.statSync(filename).isFile()) return false;
  return true;
}

function test (imagemagick) {
  if (imagemagick)
    return gm(dir + '/original.jpg').options({ imageMagick: true });
  return gm(dir + '/original.jpg');
}

function finish (filename,im) {
  return function (err) {
    if (err) {
      console.error('\n\nError occured with file: ' + filename);
      throw err;
    }

    process.stdout.write('\033[2K');
    process.stdout.write('\033[0G');
    process.stdout.write('pending ' + (q.length()+q.running()));
    process.stdout.write(' - ' + path.basename(filename));
    if (im === true) process.stdout.write(' (ImageMagick)')
    else process.stdout.write(' (GraphicsMagick)');
  }
}

process.stdout.write('\033[?25l');

var q = async.queue(function (task, callback) {
  var filename = task.filename;
  var im = task.imagemagick;

  require(filename)(test(im), dir, function (err) {
    finish(filename,im)(err);
    callback();
  }, gm, im);
}, 1);

q.drain = function(){
    process.stdout.write('\033[?25h');
    process.stdout.write('\033[2K');
    process.stdout.write('\033[0G');
    console.error("\n\u001B[32mAll tests passed\u001B[0m");
};

files = files.map(function (file) {
  return __dirname + '/' + file
})

files.forEach(function (file) {
  q.push({
    imagemagick: false,
    filename: file
  })
})

files.forEach(function (file) {
  q.push({
    imagemagick: true,
    filename: file
  })
})
