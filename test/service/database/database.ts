/// <reference path="../../../defs/node/node.d.ts" />
/// <reference path="../../../defs/mocha/mocha.d.ts" />
import DbContext = require("../../../src/core/database/dbContext");
import ICollection = require("../../../src/core/database/iCollection");
import Itinerary = require("../../../src/domain/entity/itinerary");
import ItineraryModelMap = require("../../../src/domain/modelMap/itineraryModelMap");

var Assert = require("assert");

describe("[SERVICE] Database", () => {
	
	var context: DbContext = new DbContext();
	
	it("should connect to the database", (done) => {
		Assert(context !== undefined);
		done();
	});
	
	var collection: ICollection<Itinerary> = <ICollection<Itinerary>> context.collection("itinerary", new ItineraryModelMap);
	
	it("should find the collection itinerary", (done) => {
		Assert(collection !== undefined);
		done();
	});
	
	var itinerary: Itinerary = new Itinerary("linha", "descricao", "agencia", []);
	
	it("should save the itinerary object to the database", (done) => {
		var result = collection.save(itinerary);
		Assert(result instanceof Itinerary);
		done();
	});
	
	var list: Array<Itinerary> = collection.find();
	
	it("should return object from the database", (done) => {
		Assert(list.length > 0);
		var first: Itinerary = list[0];
		Assert(first instanceof Itinerary);
		done();
	});
	
});