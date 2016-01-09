"use strict";
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const should = require("chai").should();
const svg2png = require("..");

const successTests = require("./success-tests/tests.json");

// Note:
// - 1.svg uses width/height, with no viewBox
// - 2.svg uses viewBox, with no width/height
// - 3.svg uses neither
// - 4.svg and 5.svg use width/height, viewBox, and even x/y (although x/y are zero)

function relative(relPath) {
    return path.resolve(__dirname, relPath);
}

function successTest(test, index) {
    specify(test.name, done => {
        const args = [relative(`inputs/${test.file}`), relative(`success-tests/${index}-actual.png`)];

        if ("resize" in test) {
            args.push(test.resize);
        }

        args.push(err => {
            if (err) {
                return done(err);
            }

            const expected = fs.readFileSync(relative(`success-tests/${index}.png`));
            const actual = fs.readFileSync(relative(`success-tests/${index}-actual.png`));

            actual.should.deep.equal(expected);
            done();
        });

        svg2png(...args);
    });
}

successTests.forEach(successTest);

it("should pass through errors that occur while calculating dimensions", done => {
    svg2png(relative("inputs/invalid.svg"), relative("invalid-actual.png"), err => {
        should.exist(err);
        err.should.have.property("message").and.match(/Unable to calculate dimensions./);

        done();
    });
});

it("should pass through errors about unloadable source files", done => {
    svg2png("doesnotexist.asdf", "doesnotexist.asdf2", 1.0, err => {
        should.exist(err);
        err.should.have.property("message").that.equals("Unable to load the source file.");

        done();
    });
});

after(() => {
    for (const fileName of glob.sync(relative("success-tests/*-actual.png"))) {
        fs.unlinkSync(fileName);
    }
});
