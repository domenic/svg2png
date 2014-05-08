"use strict";
/*global phantom: false*/

var fs = require("fs");
var webpage = require("webpage");

if (phantom.args.length !== 3) {
    console.error("Usage: converter.js source dest scale");
    phantom.exit();
} else {
    convert(phantom.args[0], phantom.args[1], Number(phantom.args[2]));
}

function convert(source, dest, scale) {
    var page = webpage.create();

    page.onLoadFinished = function (status) {
        if (status !== "success") {
            console.error("Unable to load the source file.");
            phantom.exit();
            return;
        }

        var dimensions = getSvgDimensions(page);
        var width = Math.round(dimensions.width * scale);
        var height = Math.round(dimensions.height * scale);
        page.viewportSize = {
            width: width,
            height: height
        };
        page.clipRect = { 
            top: 0,
            left: 0,
            width: width,
            height: height
        };
        
        page.evaluate(function (width, height) {
            var img = document.getElementsByTagName("img")[0];
            img.setAttribute("width", width);
            img.setAttribute("height", height);
        }, width, height);

        if (!dimensions.usesViewBox) {
            page.zoomFactor = scale;
        }



        // This delay is I guess necessary for the resizing to happen?
        setTimeout(function () {
            page.render(dest);
            phantom.exit();
        }, 0);
    }

    var content = fs.read(source);

    var html = "\
    <!doctype html>\
    <html>\
        <head>\
            <style>\
                * { padding: 0; margin: 0; }\
                img { display: block; }\
                svg { display: none; }\
            </style>\
        </head>\
        <body>\
            <img src=\"data:image/svg+xml;base64," + btoa(content) + "\" width=\"400\" height=\"300\" />\
            " + content + "\
        </body>\
    </html>\
    ";

    var url = "index.html";

    page.setContent(html, url);
}

function getSvgDimensions(page) {
    return page.evaluate(function () {
        /*global document: false*/

        var el = document.getElementsByTagName("svg")[0];
        var bbox = el.getBBox();

        var width = parseFloat(el.getAttribute("width"));
        var height = parseFloat(el.getAttribute("height"));
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

        return { width: width, height: height, usesViewBox: usesViewBox };
    });
}
