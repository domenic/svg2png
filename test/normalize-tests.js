"use strict";
const path = require("path");
const fileURL = require("file-url");

module.exports = tests => tests.map(test => {
    const normalized = Object.assign({}, test);
    const filename = path.resolve(__dirname, `inputs/${test.file}`);
    const phantomjsPath = path.resolve(__dirname, `inputs/${test.phantomjsPath}`);

    if (normalized.options ||
      normalized.includeFilename ||
      normalized.includeURL ||
      normalized.phantomjsPath) {
        normalized.options = Object.assign({}, test.options);

        if (normalized.includeFilename) {
            normalized.options.filename = filename;
            delete normalized.includeFilename;
        }
        if (normalized.includeURL) {
            normalized.options.url = fileURL(filename);
            delete normalized.includeURL;
        }
        if (normalized.phantomjsPath) {
            normalized.options.phantomjsPath = phantomjsPath;
            delete normalized.includePhantomjsPath;
        }
    }

    normalized.file = filename;

    return normalized;
});
