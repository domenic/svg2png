#! /usr/bin/env node

/*
 * svg2png CLI
 *
 * Copyright (c) 2012 lucor
 */

"use strict";

var fs = require('fs')
var path = require('path')
var userArgs = process.argv.slice(2)

if (!userArgs.length) {
    console.log('Usage: svg2png directory')
    console.log('Converts all the SVG to PNG in the specified directory.')
    return
}

var workPath = path.resolve(userArgs[0])
var svg2png = require("./svg2png")

if (fs.existsSync(workPath)) {
   fs.readdir(workPath, function (err, files) {
        files.forEach(function (file) {
            if (path.extname(file, '.svg') == '.svg') {
                var src = path.join(workPath, file)
                var dest = path.join(workPath, path.basename(file, '.svg') + '.png')
                svg2png(src, dest, function (err) {
                    if (err) {
                        console.error('An error occurred converting %s in %s: %s', src, dest, err)
                    } else {
                        console.info('%s has been converted in %s', src, dest)
                    }
                })
            } else {
                console.info('Skipped not svg file: %s', file)
            }
        })
    })
} else {
    console.error('Invalid directory: %s', workPath)
}

