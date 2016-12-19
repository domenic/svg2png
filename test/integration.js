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

const normalizeTests = require("./normalize-tests.js");
const successTests = normalizeTests(require("./success-tests/tests.json"));
const failureTests = normalizeTests(require("./failure-tests.json"));

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


function relative(relPath) {
    return path.resolve(__dirname, relPath);
}

function successTest(test, index) {
    specify(test.name, () => {
        const input = fs.readFileSync(test.file);
        const expected = fs.readFileSync(relative(`success-tests/${index}.png`));

        return svg2png(input, test.options).then(output => expect(output).to.deep.equal(expected));
    });
}

function successTestSync(test, index) {
    specify(test.name, () => {
        const input = fs.readFileSync(test.file);
        const expected = fs.readFileSync(relative(`success-tests/${index}.png`));

        const output = svg2png.sync(input, test.options);
        expect(output).to.deep.equal(expected);
    });
}

function successTestCLI(test, index) {
    const { args, outputFilename } = cliArgs(test, index);
    if (!args) {
        return;
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
        expect(output).to.deep.equal(expected);
    });
}

function failureTest(test) {
    specify(test.name, () => {
        const input = fs.readFileSync(test.file);

        return expect(svg2png(input, test.options)).to.be.rejectedWith(new RegExp(test.expectedErrorSubstring, "i"));
    });
}

function failureTestSync(test) {
    specify(test.name, () => {
        const input = fs.readFileSync(test.file);

        expect(() => svg2png.sync(input, test.options)).to.throw(new RegExp(test.expectedErrorSubstring, "i"));
    });
}

function failureTestCLI(test, index) {
    const { args } = cliArgs(test, index);
    if (!args) {
        return;
    }

    specify(`${test.name} [args = ${args.join(" ")}]`, () => {
        args.unshift(relative("../bin/svg2png-cli.js")); // Don't include this in the printed-out list; it's boring

        const cliOutput = childProcess.spawnSync(process.execPath, args);
        expect({
            status: cliOutput.status,
            stdout: cliOutput.stdout.toString()
        }).to.deep.equal({
            status: 1,
            stdout: ""
        });
        expect(cliOutput.stderr.toString()).to.match(new RegExp(test.expectedErrorSubstring, "i"));
    });
}

function cliArgs(test, index) {
    if (test.skipCLI) {
        return { args: null, outputFilename: null };
    }

    const outputFilename = relative(`cli-test-output/${index}.png`);
    const args = [test.file, `--output=${outputFilename}`];
    if (test.options && test.options.width) {
        args.push(`--width=${test.options.width}`);
    }
    if (test.options && test.options.height) {
        args.push(`--height=${test.options.height}`);
    }

    return { args, outputFilename };
}
