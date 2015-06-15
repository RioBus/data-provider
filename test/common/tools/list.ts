/// <reference path="../../../defs/node/node.d.ts" />
/// <reference path="../../../defs/mocha/mocha.d.ts" />
import List = require("../../../src/common/tools/list");
var Assert = require("assert");

describe("List class test", () => {
	
	var list: List<number> = new List<number>();
	list.add(1);
	list.add(2);
	list.add(3);
	list.add(4);
	list.add(5);
	
	it("should access 5 numbers", (done) => {
		Assert.equal(list.size(), 5);
		done();
	});
	
	it("should access 4 if get the 3rd position", (done) => {
		Assert.equal(list.get(3), 4);
		done();
	});
	
	it("should access an array if use method getIterable", (done) => {
		Assert.equal(list.getIterable().length, 5);
		done();
	});
});