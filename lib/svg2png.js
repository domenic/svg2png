/* eslint-env browser */

"use strict";
const fileURL = require("file-url");
const fs = require("pn/fs");
const puppeteer = require("puppeteer");
const tmp = require("tmp");

module.exports = async (source, options) => {
    try {
        options = parseOptions(options);

        const convert = typeof source === "string" ? convertFile : convertBuffer;

        return await convert(source, options);
    } catch (e) {
        throw e;
    }
};

async function convertBuffer(source, options) {
    const tempFile = await createTempFile();
    let browser;
    let output;

    try {
        const svg = source.toString("utf8");
        const start = svg.indexOf("<svg");

        const baseUri = options.url ? options.url : "http://localhost/";
        let html = `<!DOCTYPE html><base href="${baseUri}"><style>* { margin: 0; padding: 0; }</style>`;
        if (start >= 0) {
            html += svg.substring(start);
        }

        await fs.writeFile(tempFile.path, html);

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(fileURL(tempFile.path));
        await setDimensions(page, options);

        const dimensions = await getDimensions(page);
        if (!dimensions) {
            throw new Error("Width or height could not be determined from either the source file or the supplied " +
                            "dimensions");
        }

        await page.setViewport({
            width: Math.round(dimensions.width),
            height: Math.round(dimensions.height)
        });
        output = await page.screenshot({
            clip: Object.assign({ x: 0, y: 0 }, dimensions),
            omitBackground: true
        });
    } finally {
        tempFile.cleanup();

        if (browser) {
            await browser.close();
        }
    }

    return output;
}

async function convertFile(source, options) {
    const buffer = await fs.readFile(source);

    return await convertBuffer(buffer, options);
}

function createTempFile() {
    return new Promise((resolve, reject) => {
        tmp.file({ prefix: "svg2png-", postfix: ".html" }, (err, filePath, fd, cleanup) => {
            if (err) {
                reject(err);
            } else {
                resolve({ path: filePath, cleanup });
            }
        });
    });
}

async function getDimensions(page) {
    return await page.evaluate(() => {
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

async function setDimensions(page, dimensions) {
    if (dimensions.width === undefined && dimensions.height === undefined) {
        return;
    }

    await page.evaluate(({ width, height }) => {
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

function parseOptions(options) {
    options = Object.assign({}, options);

    if (typeof options.width === "string") {
        options.width = parseInt(options.width);
    }
    if (typeof options.height === "string") {
        options.height = parseInt(options.height);
    }

    if (options.filename !== undefined && options.url !== undefined) {
        throw new Error("Cannot specify both filename and url options");
    }

    // Convert filename option to url option
    if (options.filename !== undefined) {
        options.url = fileURL(options.filename);
        delete options.filename;
    }

    return options;
}
