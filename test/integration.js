"use strict";

var path = require("path");
var fs = require("fs");
var should = require("chai").should();
var svg2png = require("..");

// We can't reliably reproduce the baked PNGs across
// different machines and platforms, so we'll instead
// assert against the file sizes being within a certain
// amount of each other. A better way of doing this would
// be to do a difference check, but I don't want to
// introduce additional complexity, size, or overhead
var RENDER_DIFFERENCE_TOLERANCE = 1024;
function assertCloseEnough(file1, file2) {
    var stats1 = fs.statSync(file1);
    var stats2 = fs.statSync(file2);
    (Math.abs(stats1.size - stats2.size) < RENDER_DIFFERENCE_TOLERANCE).should.be.ok;
}

specify("Scale 1.svg to 80%", function (done) {
    svg2png(relative("images/1.svg"), relative("images/1-actual.png"), 0.8, function (err) {
        if (err) {
            return done(err);
        }
        assertCloseEnough(relative("images/1-expected.png"), relative("images/1-actual.png"));
        done();
    });
});

specify("Scale 2.svg to 180%", function (done) {
    svg2png(relative("images/2.svg"), relative("images/2-actual.png"), 1.8, function (err) {
        if (err) {
            return done(err);
        }
        assertCloseEnough(relative("images/2-expected.png"), relative("images/2-actual.png"));
        done();
    });
});

specify("Omit scale argument for 3.svg", function (done) {
    svg2png(relative("images/3.svg"), relative("images/3-actual.png"), function (err) {
        if (err) {
            return done(err);
        }
        assertCloseEnough(relative("images/3-expected.png"), relative("images/3-actual.png"));
        done();
    });
});

specify("No green border for 4.svg", function (done) {
    svg2png(relative("images/4.svg"), relative("images/4-actual.png"), function (err) {
        if (err) {
            return done(err);
        }
        assertCloseEnough(relative("images/4-expected.png"), relative("images/4-actual.png"));
        done();
    });
});

specify("Scales 5.svg correctly despite viewBox + fixed width/height", function (done) {
    svg2png(relative("images/5.svg"), relative("images/5-actual.png"), 2, function (err) {
        if (err) {
            return done(err);
        }
        assertCloseEnough(relative("images/5-expected.png"), relative("images/5-actual.png"));
        done();
    });
});

it("should pass through errors that occur while calculating dimensions", function (done) {
    svg2png(relative("images/invalid.svg"), relative("images/invalid-actual.png"), function (err) {
        should.exist(err);
        err.should.have.property("message").and.match(/Unable to calculate dimensions./);

        done();
    });
});

it("should pass through errors about unloadable source files", function (done) {
    svg2png("doesnotexist.asdf", "doesnotexist.asdf2", 1.0, function (err) {
        should.exist(err);
        err.should.have.property("message").that.equals("Unable to load the source file.");

        done();
    });
});

after(function () {
    fs.unlink(relative("images/1-actual.png"));
    fs.unlink(relative("images/2-actual.png"));
    fs.unlink(relative("images/3-actual.png"));
    fs.unlink(relative("images/4-actual.png"));
    fs.unlink(relative("images/5-actual.png"));
});

function relative(relPath) {
    return path.resolve(__dirname, relPath);
}
