"use strict";
/* eslint-disable no-console */

const path = require("path");
const fs = require("pn/fs");
const svg2png = require("../..");

const normalizeTests = require("../normalize-tests.js");
const tests = normalizeTests(require("./tests.json"));

function relative(relPath) {
    return path.resolve(__dirname, relPath);
}

tests.forEach((test, index) => {
    fs.readFile(test.file)
        .then(input => svg2png(input, test.options))
        .then(buffer => fs.writeFile(relative(`${index}.png`), buffer))
        .catch(e => console.error(`${test.file}\n\n${e.stack}\n\n\n`));
});
