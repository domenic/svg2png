"use strict"

path = require("path")
fs = require("fs")
should = require("chai").should()
svg2png = require("..")

relative = (segments...) => path.resolve(__dirname, segments...)

after =>
    fs.unlink(relative("images/1-actual.png"))
    fs.unlink(relative("images/2-actual.png"))
    fs.unlink(relative("images/3-actual.png"))

specify "Scale 1.svg to 80%", (done) =>
    svg2png(relative("images/1.svg"), relative("images/1-actual.png"), 0.8, (err) =>
        if err then return done(err)

        expected = fs.readFileSync(relative("images/1-expected.png"))
        actual = fs.readFileSync(relative("images/1-actual.png"))

        actual.should.deep.equal(expected)

        done()
    )

specify "Scale 2.svg to 180%", (done) =>
    svg2png(relative("images/2.svg"), relative("images/2-actual.png"), 1.8, (err) =>
        if err then return done(err)

        expected = fs.readFileSync(relative("images/2-expected.png"))
        actual = fs.readFileSync(relative("images/2-actual.png"))

        actual.should.deep.equal(expected)

        done()
    )

specify "Omit scale argument for 3.svg", (done) =>
    svg2png(relative("images/3.svg"), relative("images/3-actual.png"), (err) =>
        if err then return done(err)

        expected = fs.readFileSync(relative("images/3-expected.png"))
        actual = fs.readFileSync(relative("images/3-actual.png"))

        actual.should.deep.equal(expected)

        done()
    )

it "should pass errors through", (done) =>
    svg2png("doesnotexist.asdf", "doesnotexist.asdf2", 1.0, (err) =>
        should.exist(err)
        err.should.have.property("message").that.equals("Unable to load the source file.")

        done()
    )
