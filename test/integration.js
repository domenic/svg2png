"use strict";

var path = require("path");
var fs = require("fs");
var should = require("chai").should();
var svg2png = require("..");

specify("Scale 1.svg to 80%", function (done) {
    svg2png(relative("images/1.svg"), relative("images/1-actual.png"), 0.8, function (err) {
        if (err) {
            return done(err);
        }

        var expected = fs.readFileSync(relative("images/1-expected.png"));
        var actual = fs.readFileSync(relative("images/1-actual.png"));

        actual.should.deep.equal(expected);

        done();
    });
});

specify("Scale 2.svg to 180%", function (done) {
    svg2png(relative("images/2.svg"), relative("images/2-actual.png"), 1.8, function (err) {
        if (err) {
            return done(err);
        }

        var expected = fs.readFileSync(relative("images/2-expected.png"));
        var actual = fs.readFileSync(relative("images/2-actual.png"));

        actual.should.deep.equal(expected);

        done();
    });
});

specify("Omit scale argument for 3.svg", function (done) {
    svg2png(relative("images/3.svg"), relative("images/3-actual.png"), function (err) {
        if (err) {
            return done(err);
        }

        var expected = fs.readFileSync(relative("images/3-expected.png"));
        var actual = fs.readFileSync(relative("images/3-actual.png"));

        actual.should.deep.equal(expected);

        done();
    });
});

specify("No green border for 4.svg", function (done) {
    svg2png(relative("images/4.svg"), relative("images/4-actual.png"), function (err) {
        if (err) {
            return done(err);
        }

        var expected = fs.readFileSync(relative("images/4-expected.png"));
        var actual = fs.readFileSync(relative("images/4-actual.png"));

        actual.should.deep.equal(expected);

        done();
    });
});

specify("Scales 5.svg correctly despite viewBox + fixed width/height", function (done) {
    svg2png(relative("images/5.svg"), relative("images/5-actual.png"), 2, function (err) {
        if (err) {
            return done(err);
        }

        var expected = fs.readFileSync(relative("images/5-expected.png"));
        var actual = fs.readFileSync(relative("images/5-actual.png"));

        actual.should.deep.equal(expected);

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
