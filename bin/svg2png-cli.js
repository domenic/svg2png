#!/usr/bin/env node

/* eslint-disable no-process-exit */

"use strict";

const { EOL } = require("os");
const fs = require("pn/fs");
const path = require("path");
const yargs = require("yargs");

const packageJSON = require("../package.json");
const svg2png = require("..");

const argv = yargs
    .usage(`${packageJSON.description}${EOL.repeat(2)}${packageJSON.name} input.svg ` +
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

const inputFilename = argv._[0];
const outputFilename = argv.output || `${path.basename(inputFilename, ".svg")}.png`;

fs.readFile(inputFilename)
    .then(input => svg2png(input, { width: argv.width, height: argv.height, filename: inputFilename }))
    .then(output => fs.writeFile(outputFilename, output, { flag: "wx" }))
    .catch(e => {
        process.stderr.write(`${e.stack}${EOL}`);
        process.exit(1);
    });
