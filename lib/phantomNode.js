"use strict";
const fileURL = require("file-url");

function setSVGDimensions(page, width, height) {
    if (width === undefined && height === undefined) {
        return Promise.resolve();
    }

    /* eslint-disable */
    return page.evaluate(function (widthInside, heightInside) {
        /* global document: false */
        var el = document.querySelector("svg");
        if (!el) {
            return "invalid_file";
        }

        if (widthInside !== undefined) {
            el.setAttribute("width", widthInside + "px");
        } else {
            el.removeAttribute("width");
        }

        if (heightInside !== undefined) {
            el.setAttribute("height", heightInside + "px");
        } else {
            el.removeAttribute("height");
        }
    }, width, height).then(response => {
        if(response === "invalid_file") {
            throw Error("Width or height could not be determined from either" +
                " the source file or the supplied dimensions");
        }
        return response;
    });
    /* eslint-enable */
}

function getSVGDimensions(page) {
    /* eslint-disable */
    return page.evaluate(function () {
        /* global document: false */

        var el = document.querySelector("svg");
        if (!el) {
            return "invalid_file";
        }

        var widthIsPercent = /%\s*$/.test(el.getAttribute("width") || ""); // Phantom doesn't have endsWith
        var heightIsPercent = /%\s*$/.test(el.getAttribute("height") || "");
        var width = !widthIsPercent && parseFloat(el.getAttribute("width"));
        var height = !heightIsPercent && parseFloat(el.getAttribute("height"));

        if (width && height) {
            return { width: width, height: height };
        }

        var viewBoxWidth = el.viewBox.animVal.width;
        var viewBoxHeight = el.viewBox.animVal.height;

        if (width && viewBoxHeight) {
            return { width: width, height: width * viewBoxHeight / viewBoxWidth };
        }

        if (height && viewBoxWidth) {
            return { width: height * viewBoxWidth / viewBoxHeight, height: height };
        }

        return null;
    }).then(response => {
        if(response === "invalid_file") {
            throw Error("Width or height could not be determined from either" +
                " the source file or the supplied dimensions");
        }
        return response;
    });
    /* eslint-enable */
}


module.exports = (sourceBuffer, options = {}) => {
    const instance = options.phantomJS;
    const content = `<!DOCTYPE html><html>
<head><style>html, body { margin: 0; padding: 0; } svg { position: absolute; top: 0; left: 0; }</style>
</head>
<body style="margin: 0; padding: 0;">
${sourceBuffer.toString("utf8")}
</body>
</html>`;

    if (options.filename !== undefined && options.url !== undefined) {
        throw new Error("Cannot specify both filename and url options");
    }

    if (options.filename !== undefined) {
        options = Object.assign({ url: fileURL(options.filename) }, options);
        delete options.filename;
    }

    return instance.createPage()
        .then(page => page.setContent(content, options.url || "http://example.com/")
            .then(() => options.width !== undefined || options.height !== undefined ?
                setSVGDimensions(page, options.width, options.height) :
                Promise.resolve())
            .then(() => getSVGDimensions(page))
            .then(dimensions => {
                if (!dimensions) {
                    throw Error("Width or height could not be determined from either" +
                        " the source file or the supplied dimensions");
                }
                return setSVGDimensions(page, dimensions.width, dimensions.height)
                    .then(() => Promise.all([
                        page.property("viewportSize", {
                            width: dimensions.width,
                            height: dimensions.height
                        }),
                        page.property("clipRect", {
                            top: 0,
                            left: 0,
                            width: dimensions.width,
                            height: dimensions.height
                        })
                    ]));
            })
            .then(() => page.renderBase64("PNG"))
        )
        .then(base64 => new Buffer(base64, "base64"));
};
