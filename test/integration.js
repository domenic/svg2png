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

function failureTest(test) {
    specify(`(negative test) ${test.name}`, () => {
        const input = fs.readFileSync(relative(`inputs/${test.file}`));

        return svg2png(input, test.resize).should.be.rejectedWith(/width or height/i);
    });
}

successTests.forEach(successTest);
failureTests.forEach(failureTest);
