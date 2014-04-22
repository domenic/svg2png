"use strict";

var path = require("path");
var fs = require("fs");
var should = require("chai").should();
var svg2png = require("..");
var svgAnim2png = require("../lib/svg2pngs");

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

specify("Animation test 3 images in 3 seconds", function (done) {
	svgAnim2png(relative("images/5.svg"), relative("images/5-actual.png"), 3, 3, function (err) {
        if (err) {
            return done(err);
        }

        var expected = fs.readFileSync(relative("images/5-expected0.png"));
        var actual = fs.readFileSync(relative("images/5-actual0.png"));
        actual.should.deep.equal(expected);
        
        var expected = fs.readFileSync(relative("images/5-expected1.png"));
        var actual = fs.readFileSync(relative("images/5-actual1.png"));
        actual.should.deep.equal(expected);
        
        var expected = fs.readFileSync(relative("images/5-expected2.png"));
        var actual = fs.readFileSync(relative("images/5-actual2.png"));
        actual.should.deep.equal(expected);

        done();
    });
});

it("should pass errors through", function (done) {
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
    fs.unlink(relative("images/5-actual0.png"));
    fs.unlink(relative("images/5-actual1.png"));
    fs.unlink(relative("images/5-actual2.png"));
});

function relative(relPath) {
    return path.resolve(__dirname, relPath);
}
