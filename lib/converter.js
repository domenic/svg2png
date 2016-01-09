"use strict";

/* global phantom: true */

var webpage = require("webpage");
var system = require("system");

if (system.args.length !== 4) {
    console.error("Usage: converter.js source dest resize");
    phantom.exit();
} else {
    convert(system.args[1], system.args[2], system.args[3]);
}

function convert(source, dest, resize) {
    var page = webpage.create();

    page.open(source, function (status) {
        if (status !== "success") {
            console.error("Unable to load the source file.");
            phantom.exit();
            return;
        }

        try {
            if (resize[0] === "{") {
                resize = JSON.parse(resize);
                var width = resize.width;
                var height = resize.height;
                if (width === undefined || height === undefined) {
                    var dims = getSvgDimensions(page);
                    if (width === undefined && height === undefined) {
                        width = dims.width;
                        height = dims.height;
                    } else if (width === undefined) {
                        var widthScale = height / dims.height;
                        width = dims.width * widthScale;
                    } else if (height === undefined) {
                        var heightScale = width / dims.width;
                        height = dims.height * heightScale;
                    }
                }
                width = Math.round(width);
                height = Math.round(height);
                page.viewportSize = {
                    width: width,
                    height: height
                };
                setSvgDimensions(page, width, height);
            } else {
                var scale = Number(resize);
                var dimensions = getSvgDimensions(page);
                page.viewportSize = {
                    width: Math.round(dimensions.width * scale),
                    height: Math.round(dimensions.height * scale)
                };
                if (dimensions.shouldScale) {
                    page.zoomFactor = scale;
                }
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

function setSvgDimensions(page, width, height) {
    return page.evaluate(function (width, height) {
        /* global document: true */
        var el = document.documentElement;

        var viewBoxWidth = el.viewBox.animVal.width;
        var viewBoxHeight = el.viewBox.animVal.height;
        var usesViewBox = viewBoxWidth && viewBoxHeight;

        if (!usesViewBox) {
            var bbox = el.getBBox();
            var bX = Math.round(bbox.x);
            var bY = Math.round(bbox.y);
            var bWidth = Math.round(bbox.width);
            var bHeight = Math.round(bbox.height);
            el.setAttribute("viewBox", bX + " " + bY + " " + bWidth + " " + bHeight);
        }

        el.setAttribute("width", width + "px");
        el.setAttribute("height", height + "px");
    }, width, height);
}

function getSvgDimensions(page) {
    return page.evaluate(function () {
        /* global document: true */

        var el = document.documentElement;
        var bbox = el.getBBox();

        var width = parseFloat(el.getAttribute("width"));
        var widthIsPercent = /%\s*$/.test(el.getAttribute("width") || ""); // Phantom doesn't have endsWith
        var height = parseFloat(el.getAttribute("height"));
        var heightIsPercent = /%\s*$/.test(el.getAttribute("height") || "");

        var hasWidthOrHeight = width || height;
        var viewBoxWidth = el.viewBox.animVal.width;
        var viewBoxHeight = el.viewBox.animVal.height;
        var usesViewBox = viewBoxWidth && viewBoxHeight;

        if (usesViewBox) {
            if (widthIsPercent) {
                width = viewBoxWidth / 100 * width;
            }
            if (heightIsPercent) {
                height = viewBoxHeight / 100 * height;
            }

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

        var shouldScale = (hasWidthOrHeight && !widthIsPercent && !heightIsPercent) || !usesViewBox;
        return { width: width, height: height, shouldScale: shouldScale };
    });
}
