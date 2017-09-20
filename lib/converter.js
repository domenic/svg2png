/* eslint-env browser */

"use strict";

exports.convert = (page, options) => {
    return setSVGDimensions(page, options)
        .then(() => getSVGDimensions(page))
        .then(dimensions => {
            if (!dimensions) {
                throw new Error("Width or height could not be determined from either the source file or the supplied " +
                                "dimensions");
            }

            return setSVGDimensions(page, dimensions);
        })
        .then(() => createPNGDataURL(page));
};

function createPNGDataURL(page) {
    return page.evaluate(() => {
        const el = document.querySelector("svg");
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(el.outerHTML)}`;

        return new Promise((resolve, reject) => {
            image.onerror = () => reject(new Error("Failed to write SVG to image"));
            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;

                context.drawImage(image, 0, 0);

                resolve(canvas.toDataURL("image/png"));
            };
        });
    });
}

function setSVGDimensions(page, dimensions) {
    if (dimensions.width === undefined && dimensions.height === undefined) {
        return Promise.resolve();
    }

    return page.evaluate(({ width, height }) => {
        const el = document.querySelector("svg");
        if (!el) {
            return;
        }

        if (width !== undefined) {
            el.setAttribute("width", `${width}px`);
        } else {
            el.removeAttribute("width");
        }

        if (height !== undefined) {
            el.setAttribute("height", `${height}px`);
        } else {
            el.removeAttribute("height");
        }
    }, dimensions);
}

function getSVGDimensions(page) {
    return page.evaluate(() => {
        const el = document.querySelector("svg");
        if (!el) {
            return null;
        }

        const widthIsPercent = (el.getAttribute("width") || "").endsWith("%");
        const heightIsPercent = (el.getAttribute("height") || "").endsWith("%");
        const width = !widthIsPercent && parseFloat(el.getAttribute("width"));
        const height = !heightIsPercent && parseFloat(el.getAttribute("height"));

        if (width && height) {
            return { width, height };
        }

        const viewBoxWidth = el.viewBox.animVal.width;
        const viewBoxHeight = el.viewBox.animVal.height;

        if (width && viewBoxHeight) {
            return { width, height: width * viewBoxHeight / viewBoxWidth };
        }

        if (height && viewBoxWidth) {
            return { width: height * viewBoxWidth / viewBoxHeight, height };
        }

        return null;
    });
}
