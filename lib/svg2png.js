"use strict";

var path = require("path");
var execFile = require("child_process").execFile;

var phantomjsCmd = require("phantomjs").path;
var converterFileName = path.resolve(__dirname, "./converter.js");

module.exports = function svgToPng(sourceFileName, destFileName, resize, cb) {
    if (typeof resize === "function") {
        cb = resize;
        resize = 1.0;
    } else if (typeof resize === "object") {
        resize = JSON.stringify(resize);
    }

    var args = [converterFileName, sourceFileName, destFileName, resize];
    execFile(phantomjsCmd, args, function (err, stdout, stderr) {
        if (err) {
            cb(err);
        } else if (stdout.length > 0) { // PhantomJS always outputs to stdout.
            cb(new Error(stdout.toString().trim()));
        } else if (stderr.length > 0) { // But hey something else might get to stderr.
            cb(new Error(stderr.toString().trim()));
        } else {
            cb(null);
        }
    });
};
