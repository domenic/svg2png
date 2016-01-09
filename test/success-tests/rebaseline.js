"use strict";
const path = require("path");
const fs = require("fs");
const svg2png = require("../..");

const tests = require("./tests.json");

function relative(relPath) {
    return path.resolve(__dirname, relPath);
}

tests.forEach((test, index) => {
    const args = [relative(`../inputs/${test.file}`), relative(`${index}.png`)];

    if ("resize" in test) {
        args.push(test.resize);
    }

    args.push(err => {
        if (err) {
            throw err;
        }
    });

    svg2png(...args);
});
