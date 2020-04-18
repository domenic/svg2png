#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const svg2png = require("..");
const packageJSON = require("../package.json");

const argv = yargs
    .usage(`${packageJSON.description}\n\n${packageJSON.name} input.svg ` +
           `[--output=output.png] [--width=300] [--height=150] [--time=10.5]`)
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
    .option("t", {
        alias: "time",
        type: "string",
        describe: "The time of the snapshot (for animated SVG), in seconds"
    })
    .demand(1)
    .help(false)
    .version()
    .argv;

// TODO if anyone asks for it: support stdin/stdout when run that way

const input = fs.readFileSync(argv._[0]);
const output = svg2png.sync(input, { width: argv.width, height: argv.height, filename: argv._[0], time: argv.time });

const outputFilename = argv.output || path.basename(argv._[0], ".svg") + ".png";
fs.writeFileSync(outputFilename, output, { flag: "wx" });
