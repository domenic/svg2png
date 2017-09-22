"use strict";

const path = require("path");
const fs = require("pn/fs");
const svg2png = require("../..");

const normalizeTests = require("../normalize-tests.js");
const tests = normalizeTests(require("./tests.json"));

(async() => {
    let index = 0;
    for (const test of tests) {
        try {
            const buffer = await svg2png(test.file, test.options);

            await fs.writeFile(path.resolve(__dirname, `${index}.png`), buffer);
        } catch (e) {
            process.stdout.write(`${test.file}\n\n${e.stack}\n\n\n`);
        }

        index++;
    }
})();
