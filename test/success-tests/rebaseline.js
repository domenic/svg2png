"use strict";
const path = require("path");
const fs = require("pn/fs");
const svg2png = require("../..");

const tests = require("./tests.json");

function relative(relPath) {
    return path.resolve(__dirname, relPath);
}

// TODO do this all sync maybe
tests.forEach((test, index) => {
    fs.readFile(relative(`../inputs/${test.file}`))
        .then(input => svg2png(input, test.resize))
        .then(buffer => fs.writeFile(relative(`${index}.png`), buffer))
        .catch(e => console.error(`${test.file}\n\n${e.stack}\n\n\n`));
});
