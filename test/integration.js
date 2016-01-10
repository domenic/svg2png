"use strict";
const path = require("path");
const fs = require("fs");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const svg2png = require("..");

chai.use(chaiAsPromised);
chai.should();

const successTests = require("./success-tests/tests.json");
const failureTests = require("./failure-tests.json");

function relative(relPath) {
    return path.resolve(__dirname, relPath);
}

function successTest(test, index) {
    specify(test.name, () => {
        const input = fs.readFileSync(relative(`inputs/${test.file}`));
        const expected = fs.readFileSync(relative(`success-tests/${index}.png`));

        return svg2png(input, test.resize).then(output => output.should.deep.equal(expected));
    });
}

function successTestSync(test, index) {
    specify(test.name, () => {
        const input = fs.readFileSync(relative(`inputs/${test.file}`));
        const expected = fs.readFileSync(relative(`success-tests/${index}.png`));

        const output = svg2png.sync(input, test.resize);
        output.should.deep.equal(expected);
    });
}

function failureTest(test) {
    specify(test.name, () => {
        const input = fs.readFileSync(relative(`inputs/${test.file}`));

        return svg2png(input, test.resize).should.be.rejectedWith(/width or height/i);
    });
}

function failureTestSync(test) {
    specify(test.name, () => {
        const input = fs.readFileSync(relative(`inputs/${test.file}`));

        (() => svg2png.sync(input, test.resize)).should.throw(/width or height/i);
    });
}

describe("async", () => {
    describe("should fulfill", () => successTests.forEach(successTest));
    describe("should reject", () => failureTests.forEach(failureTest));
});

describe("sync", () => {
    describe("should return", () => successTests.forEach(successTestSync));
    describe("should throw", () => failureTests.forEach(failureTestSync));
});
