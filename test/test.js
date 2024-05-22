const test = require('node:test');
const {strictEqual} = require("assert");

test('synchronous passing test', t => {
    // This test passes because it does not throw an exception.
    strictEqual(1, 1)
})