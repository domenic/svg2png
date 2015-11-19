"use strict";

/* global phantom: true */

var webpage = require("webpage");
var system = require("system");
var Promise = require("bluebird");

var BAD_DIMENSIONS = 1;
var BAD_FILE = 2;

var argv = {};

if (!processArgs()) {
    console.error("Usage: converter.js source dest [scale]");
    phantom.exit();
} else {
    conversionBegin();
}

/**
 * Processes the arguments passed and returns whether they are valid
 */
function processArgs() {
    var args = system.args;
    var retVal = false;
    for (var i = 1; i < args.length; i++) {

        if (args[i] === "--multiple-images") {
            argv.multiImage = true;
        // Ignoring flags, the args are order specific: source, dest, scale
        } else if (!argv.hasOwnProperty("source")) {
            argv.source = args[i];
        } else if (!argv.hasOwnProperty("dest")) {
            argv.dest = args[i];
        } else if (!argv.hasOwnProperty("scale") && !isNaN(args[i] - 0)) {
            argv.scale = Number(args[i]);
        }
    }

    argv.scale = argv.scale || 1.0;
    retVal = argv.hasOwnProperty("source") && argv.hasOwnProperty("dest");

    if (retVal && argv.multiImage) {
        argv.source = JSON.parse(argv.source);
        try {
            var dest = JSON.parse(argv.dest);
            argv.dest = dest;
        } catch (e) {}
    }

    return retVal;
}

function generateDestName(source) {
    var retVal = argv.dest;
    if (argv.multiImage) {
        if (argv.dest instanceof Array) {
            retVal = argv.dest.shift();

        // In the case of an array of inputs and a single output (directory),
        // the destination filename will be input_file.png
        } else {
            retVal = source.split("/").pop().split(".");
            retVal.pop();
            retVal = argv.dest + "/" + retVal.join(".") + ".png";
        }
    }
    return retVal;
}

function conversionFailed(err) {
    console.error("[" + err.file + "] " + err.message);
    if (err.exception) {
        console.error(err.exception);
    }
    phantom.exit();
}

function conversionBegin() {
    var source = argv.multiImage ? argv.source.shift() : argv.source;
    var dest = generateDestName(source);

    convert(source, dest, argv.scale).then(function() {
        if (argv.multiImage && argv.source.length > 0) {
            conversionBegin();
        } else {
            phantom.exit();
        }
    }).catch(conversionFailed);
}

function convert(source, dest, scale) {
    return new Promise(function(resolve, reject) {
        var page = webpage.create();

        page.open(source, function (status) {
            if (status !== "success") {
                reject({ err: BAD_FILE, message: "Unable to load the source file.", file: source });
                return;
            }

            try {
                var dimensions = getSvgDimensions(page);
                page.viewportSize = {
                    width: Math.round(dimensions.width * scale),
                    height: Math.round(dimensions.height * scale)
                };
                if (dimensions.shouldScale) {
                    page.zoomFactor = scale;
                }
            } catch (e) {
                reject({ err: BAD_DIMENSIONS, message: "Unable to calculate dimensions.", file: source, exception: e });
                return;
            }

            // This delay is I guess necessary for the resizing to happen?
            setTimeout(function () {
                page.render(dest, { format: "png" });
                page.close();
                resolve();
            }, 0);
        });
    });
}

function getSvgDimensions(page) {
    return page.evaluate(function () {
        /* global document: true */

        var el = document.documentElement;
        var bbox = el.getBBox();

        var width = parseFloat(el.getAttribute("width"));
        var height = parseFloat(el.getAttribute("height"));
        var hasWidthOrHeight = width || height;
        var viewBoxWidth = el.viewBox.animVal.width;
        var viewBoxHeight = el.viewBox.animVal.height;
        var usesViewBox = viewBoxWidth && viewBoxHeight;

        if (usesViewBox) {
            if (width && !height) {
                height = width * viewBoxHeight / viewBoxWidth;
            }
            if (height && !width) {
                width = height * viewBoxWidth / viewBoxHeight;
            }
            if (!width && !height) {
                width = viewBoxWidth;
                height = viewBoxHeight;
            }
        }

        if (!width) {
            width = bbox.width + bbox.x;
        }
        if (!height) {
            height = bbox.height + bbox.y;
        }

        return { width: width, height: height, shouldScale: hasWidthOrHeight || !usesViewBox };
    });
}
