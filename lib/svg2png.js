"use strict";

var path = require("path");
var execFile = require("child_process").execFile;
var tmp = require("tmp");
var fs = require("fs");

var phantomjsCmd = require("phantomjs").path;
var converterFileName = path.resolve(__dirname, "./converter.js");

module.exports = function svgToPng(sourceFileName, destFileName, scale, cb) {
    var flags = [];
    var sourceFiles;
    var destFiles;
    var temp;

    if (typeof scale === "function") {
        cb = scale;
        scale = 1.0;
    }

    // Check for multiple outputs
    if (destFileName instanceof Array) {
        // The input needs to also be an array and of the same length
        if (!(sourceFileName instanceof Array) || sourceFileName.length !== destFileName.length) {
            throw "Array of outputs must be used with an array of inputs of the same length.";
        }
        destFiles = tmp.fileSync();
        fs.writeFileSync(destFiles.name, JSON.stringify(destFileName));
        destFileName = destFiles.name;
        flags.push("--multiple-dests");
    }


    // Handle multiple incoming files
    if (sourceFileName instanceof Array) {
        sourceFiles = tmp.fileSync();
        fs.writeFileSync(sourceFiles.name, JSON.stringify(sourceFileName));
        sourceFileName = sourceFiles.name;
        flags.push("--multiple-sources");
    }
    var args = [converterFileName, sourceFileName, destFileName, scale ].concat(flags);
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

        // Close out temp files
        if (sourceFiles) {
            sourceFiles.removeCallback();
        }
        if (destFiles) {
            destFiles.removeCallback();
        }

    });
};
