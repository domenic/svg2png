#!/usr/bin/env node

/* eslint-disable no-process-exit */

"use strict";
const fs = require("pn/fs");
const path = require("path");
const yargs = require("yargs");
const svg2png = require("..");
const packageJSON = require("../package.json");

const argv = yargs
    .usage(`${packageJSON.description}\n\n${packageJSON.name} input.svg ` +
           `[--output=output.png] [--width=300] [--height=150]`)
    .option("o", {
        alias: "output",
        type: "string",
        describe: "The output filename; if not provided, will be inferred"
    })
    .option("w", {
        alias: "width",
        type: "string",
        describe: "The output file width, in pixels"
    })
    .option("h", {
        alias: "height",
        type: "string",
        describe: "The output file height, in pixels"
    })
    .demand(1)
    .help(false)
    .version()
    .argv;

// TODO if anyone asks for it: support stdin/stdout when run that way

(async() => {
    try {
        const inputFilename = argv._[0];
        const outputFilename = argv.output || `${path.basename(inputFilename, ".svg")}.png`;
        const output = await svg2png(inputFilename, {
            width: argv.width,
            height: argv.height,
            filename: inputFilename
        });

        await fs.writeFile(outputFilename, output, { flag: "wx" });
    } catch (e) {
        process.stderr.write(`${e.stack}\n`);
        process.exit(1);
    }
})();
