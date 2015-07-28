declare var require, describe, it, global;
import Config = require("../../../src/config");
import DbContext = require("../../../src/core/database/dbContext");
import ICollection = require("../../../src/core/database/iCollection");
import Itinerary = require("../../../src/domain/entity/itinerary");
import ItineraryModelMap = require("../../../src/domain/modelMap/itineraryModelMap");
import Strings = require("../../../src/strings");

var Assert = require("assert");
global.Config = Config;
global.Strings = Strings;

describe("[SERVICE] Database", () => {
	
	var config: any = {
		driver: "mongodb",
		config: {
			dbName: "riobus",
			host: "ds047742.mongolab.com",
			user: "riobus",
			pass: "riobus",
			port: "47742"
		}
	};
	
	var context: DbContext = new DbContext(config);
	
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
	
	it("should find or create the itinerary object in the database", (done) => {
		var result = collection.findOrCreate(itinerary);
		Assert(result instanceof Itinerary);
		done();
	});
	
	var list: Itinerary[] = collection.find({});
	
	it("should return object from the database", (done) => {
		Assert(list.length > 0);
		var first: Itinerary = list[0];
		Assert(first instanceof Itinerary);
		done();
	});
	
});