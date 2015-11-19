"use strict";

/* global phantom: true */

var webpage = require("webpage");
var system = require("system");
var argv = {
    scale: 1.0
};

if (!processArgs()) {
    console.error("Usage: converter.js source dest [scale]");
    phantom.exit();
} else {
    convert(argv.source, argv.dest, argv.scale);
}

/**
 * Processes the arguments passed and returns whether they are valid
 */
function processArgs() {
    var args = system.args;
    for (var i = 1; i < args.length; i++) {
        // Ignoring flags, the args are order specific: source, dest, scale
        if (!argv.hasOwnProperty('source')) {
            argv.source = args[i];
        } else if (!argv.hasOwnProperty('dest')) {
            argv.dest = args[i];
        } else if (!isNaN(args[i] - 0)) {
            argv.scale = Number(args[i]);
        }
    }

    return argv.hasOwnProperty('source') && argv.hasOwnProperty('dest');
}

function convert(source, dest, scale) {
    var page = webpage.create();

    page.open(source, function (status) {
        if (status !== "success") {
            console.error("Unable to load the source file.");
            phantom.exit();
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
            console.error("Unable to calculate dimensions.");
            console.error(e);
            phantom.exit();
            return;
        }

        // This delay is I guess necessary for the resizing to happen?
        setTimeout(function () {
            page.render(dest, { format: "png" });
            phantom.exit();
        }, 0);
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
