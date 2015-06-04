/// <reference path="../defs/node/node.d.ts" />
/// <reference path="../defs/mocha/mocha.d.ts" />
var Assert = require("assert");

describe("Sample test case", () => {
	it("should pass", (done) => {
		Assert.equal(true, true);
		done();
	});
});