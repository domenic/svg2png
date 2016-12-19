"use strict";
const path = require("path");
const fileURL = require("file-url");
const childProcess = require("pn/child_process");

const phantomjsCmd = require("phantomjs-prebuilt").path;
const converterFileName = path.resolve(__dirname, "./converter.js");

const PREFIX = "data:image/png;base64,";

module.exports = (sourceBuffer, options) => {
    const multiple = Boolean(options && options.dimensions);
    return Promise.resolve().then(() => { // catch thrown errors
        const cp = childProcess.execFile(phantomjsCmd, getPhantomJSArgs(options), { maxBuffer: Infinity });

        writeBufferInChunks(cp.stdin, sourceBuffer);

        return cp.promise.then(r => processResult(r, multiple));
    });
};

module.exports.sync = (sourceBuffer, options) => {
    const multiple = Boolean(options && options.dimensions);
    const result = childProcess.spawnSync(phantomjsCmd, getPhantomJSArgs(options), {
        input: sourceBuffer.toString("utf8")
    });
    return processResult(result, multiple);
};

function getPhantomJSArgs(options = {}) {
    if (options.filename !== undefined && options.url !== undefined) {
        throw new Error("Cannot specify both filename and url options");
    }

    // Convert filename option to url option
    if (options.filename !== undefined) {
        options = Object.assign({ url: fileURL(options.filename) }, options);
        delete options.filename;
    }

    let dimensions = options.dimensions;
    if (!dimensions) {
        dimensions = [{
            width: options.width,
            height: options.height
        }];
    }

    return [
        converterFileName,
        JSON.stringify({
            filename: options.filename,
            url: options.url,
            dimensions: dimensions
        })
    ];
}

function writeBufferInChunks(writableStream, buffer) {
    const asString = buffer.toString("utf8");

    const INCREMENT = 1024;

    writableStream.cork();
    for (let offset = 0; offset < asString.length; offset += INCREMENT) {
        writableStream.write(asString.substring(offset, offset + INCREMENT));
    }
    writableStream.end();
}

function processResult(result, multiple) {
    const stdout = result.stdout.toString();
    if (stdout.startsWith(PREFIX)) {
        if (multiple) {
            const encoded = stdout.split("|");
            return encoded.map((r) => new Buffer(r.substring(PREFIX.length), "base64"));
        }
        return new Buffer(stdout.substring(PREFIX.length), "base64");
    }

    if (stdout.length > 0) {
        // PhantomJS always outputs to stdout.
        throw new Error(stdout.replace(/\r/g, "").trim());
    }

    const stderr = result.stderr.toString();
    if (stderr.length > 0) {
        // But hey something else might get to stderr.
        throw new Error(stderr.replace(/\r/g, "").trim());
    }

    throw new Error("No data received from the PhantomJS child process");
}
