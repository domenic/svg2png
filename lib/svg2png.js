"use strict";
const fileURL = require("file-url");
const puppeteer = require("puppeteer");
const converter = require("./converter");

const PREFIX = "data:image/png;base64,";

module.exports = (sourceBuffer, options) => {
    return Promise.resolve().then(() => { // catch thrown errors
        options = parseOptions(options);

        return puppeteer.launch()
            .then(browser => convert(sourceBuffer, browser, options))
            .then(([dataURL, browser]) => Promise.all([dataURL, browser.close()]))
            .then(([dataURL]) => processDataURL(dataURL));
    });
};

function convert(sourceBuffer, browser, options) {
    return browser.newPage()
      .then(page => {
          const svg = sourceBuffer.toString("utf8");

          return Promise.all([page, page.setContent(svg)]);
      })
      .then(([page]) => Promise.all([converter.convert(page, options), browser]));
}

function parseOptions(options) {
    options = Object.assign({}, options);

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

function processDataURL(dataURL) {
    if (dataURL && dataURL.startsWith(PREFIX)) {
        return Buffer.from(dataURL.substring(PREFIX.length), "base64");
    }

    throw new Error("Failed to convert SVG to PNG");
}
