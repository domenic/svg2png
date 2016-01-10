"use strict";
const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const svg2png = require("..");

chai.use(chaiAsPromised);
const expect = require("chai").expect;

const successTests = require("./success-tests/tests.json");
const failureTests = require("./failure-tests.json");

function relative(relPath) {
    return path.resolve(__dirname, relPath);
}

function successTest(test, index) {
    specify(test.name, () => {
        const input = fs.readFileSync(relative(`inputs/${test.file}`));
        const expected = fs.readFileSync(relative(`success-tests/${index}.png`));

        return svg2png(input, test.resize).then(output => expect(output).to.deep.equal(expected));
    });
}

function successTestSync(test, index) {
    specify(test.name, () => {
        const input = fs.readFileSync(relative(`inputs/${test.file}`));
        const expected = fs.readFileSync(relative(`success-tests/${index}.png`));

        const output = svg2png.sync(input, test.resize);
        expect(output).to.deep.equal(expected);
    });
}

function successTestCLI(test, index) {
    const outputFilename = relative(`cli-test-output/${index}.png`);
    const args = [relative(`inputs/${test.file}`), `--output=${outputFilename}`];
    if (test.resize && test.resize.width) {
        args.push(`--width=${test.resize.width}`);
    }
    if (test.resize && test.resize.height) {
        args.push(`--height=${test.resize.height}`);
    }

    specify(`${test.name} [args = ${args.join(" ")}]`, () => {
        args.unshift(relative("../bin/svg2png-cli.js")); // Don't include this in the printed-out list; it's boring

        const cliOutput = childProcess.spawnSync(process.execPath, args);
        expect({
            status: cliOutput.status,
            stdout: cliOutput.stdout.toString(),
            stderr: cliOutput.stderr.toString()
        }).to.deep.equal({
            status: 0,
            stdout: "",
            stderr: ""
        });

        const expected = fs.readFileSync(relative(`success-tests/${index}.png`));
        const output = fs.readFileSync(outputFilename);
        // expect(output).to.deep.equal(expected);
    });
}

function failureTest(test) {
    specify(test.name, () => {
        const input = fs.readFileSync(relative(`inputs/${test.file}`));

        return expect(svg2png(input, test.resize)).to.be.rejectedWith(/width or height/i);
    });
}

function failureTestSync(test) {
    specify(test.name, () => {
        const input = fs.readFileSync(relative(`inputs/${test.file}`));

        expect(() => svg2png.sync(input, test.resize)).to.throw(/width or height/i);
    });
}

function failureTestCLI(test, index) {
    const outputFilename = relative(`cli-test-output/${index}.png`);
    const args = [relative(`inputs/${test.file}`), `--output=${outputFilename}`];
    if (test.resize && test.resize.width) {
        args.push(`--width=${test.resize.width}`);
    }
    if (test.resize && test.resize.height) {
        args.push(`--height=${test.resize.height}`);
    }

    specify(`${test.name} [args = ${args.join(" ")}]`, () => {
        args.unshift(relative("../bin/svg2png-cli.js")); // Don't include this in the printed-out list; it's boring

        const cliOutput = childProcess.spawnSync(process.execPath, args);
        expect({
            status: cliOutput.status,
            stdout: cliOutput.stdout.toString(),
        }).to.deep.equal({
            status: 1,
            stdout: ""
        });
        expect(cliOutput.stderr.toString()).to.match(/width or height/i);
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

describe("CLI", () => {
    before(() => mkdirp.sync(relative("cli-test-output")));
    describe("should succeed", () => successTests.forEach(successTestCLI));
    describe("should fail", () => failureTests.forEach(failureTestCLI));
    after(() => rimraf.sync(relative("cli-test-output")));
});
