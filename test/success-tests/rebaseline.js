"use strict";

const { EOL } = require("os");
const fs = require("pn/fs");
const path = require("path");

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
        .catch(e => process.stderr.write(`${test.file}${EOL.repeat(2)}${e.stack}${EOL.repeat(3)}`));
});
