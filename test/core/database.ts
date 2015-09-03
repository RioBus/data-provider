declare var require, describe, it, global;
import DbContext = require("../../src/core/database/dbContext");
import IBulk = require("../../src/core/database/iBulk");
import ICollection = require("../../src/core/database/iCollection");
import Itinerary = require("../../src/domain/entity/itinerary");
import ItineraryModelMap = require("../../src/domain/modelMap/itineraryModelMap");

var Assert = require("assert");

describe("Database", () => {
	
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
	var context: DbContext;
	try{
		context = new DbContext(config);
	}catch(e){}
	
	it("should connect to the database", (done) => {
		var current : DbContext = context;
		var notExpected : DbContext = undefined; 
		Assert.notEqual(current, notExpected);
		done();
	});
	var collection: ICollection<Itinerary>;
	try{
		collection = <ICollection<Itinerary>> context.collection("itinerary", new ItineraryModelMap());
	}
	catch(e){}
	
	it("should find the collection itinerary", (done) => {
		var current : ICollection<Itinerary> = collection;
		var notExpected : ICollection<Itinerary> = undefined;
		Assert.notEqual(current, notExpected);
		done();
	});
	
	var description: string = (new Date()).toString();
	
	var itinerary: Itinerary = new Itinerary("linha", description, "agencia", []);
	
	it("should save the itinerary object to the database", (done) => {
		var current: Itinerary = collection.save(itinerary);
		var notExpected: Itinerary = null;
		Assert.notEqual(current, notExpected);
		done();
	});
	
	it("should find or create the Itinerary object in the database", (done) => {
		var current: Itinerary = collection.findOrCreate(itinerary);
		var notExpected : Itinerary = null;
		Assert.notEqual(current, notExpected);
		done();
	});
	
	var list: Itinerary[] = collection.find({});
	
	it("should return a list not empty", (done) =>{
		var current: number = list.length;
		var notExpected: number = 0;
		Assert.notEqual(current, notExpected);
		done();
	});
	
	it("should find Itinerary instances from the collection", (done) => {
		var current: boolean = list[0] instanceof Itinerary;
		var expected: boolean = true;
		Assert.equal(current, expected);
		done();
	});
	
	it("should return the number of documents from the collection", (done) => {
		var current: number = collection.count({});
		var notExpected: number = 0;
		Assert.notEqual(current, notExpected);
		done();
	});
	
	it("should return one document", (done) => {
		var current: Itinerary = collection.findOne(itinerary);
		var notExpected: Itinerary = null;
		Assert.notEqual(current, notExpected);
		done();
	});
	
	it("should update a document", (done) => {
		var obj: any = JSON.stringify(itinerary);
		obj = JSON.parse(obj);
		obj.line = expected;
		delete obj._id;
		
		var current: boolean = collection.update(itinerary, obj);
		var expected: boolean = true;
		
		Assert.equal(current, expected);
		done();
	});
	
	it("should delete a document in the collection", done =>{
		var current: boolean = collection.remove({ description: description });
		var expected: boolean = true;
		Assert.equal(current, expected);
		done();
	});
	
	it("should batch insert a document in the collection", (done) => {
		var itinerary: Itinerary = new Itinerary("linha", description, "agencia", []);
		var bulk: IBulk<Itinerary> = collection.initBulk();
		bulk.insert(itinerary);
		var current: any;
		var expected: boolean = true;
		try{
			bulk.execute();
			current = true;
		} catch(e){
			current = e;
		} finally {
			Assert.equal(current, expected);
			done();
		}
	});
	
	it("should batch update a document in the collection", (done) => {
		var itinerary: Itinerary = new Itinerary("linha", description, "agencia", []);
		var bulk: IBulk<Itinerary> = collection.initBulk();
		
		var update: any = JSON.stringify(itinerary);
		update = JSON.parse(update);
		update.line = "batch";
		delete update._id;
		bulk.find(itinerary).update(update);
		var current: any;
		var expected: boolean = true;
		try{
			bulk.execute();
			current = true;
		} catch(e){
			current = e;
		} finally {
			Assert.equal(current, expected);
			done();
		}
	});
	
	it("should batch replace a document in the collection", (done) => {
		var itinerary: Itinerary = new Itinerary("batch", description, "agencia", []);
		var bulk: IBulk<Itinerary> = collection.initBulk();
		
		var update: any = JSON.stringify(itinerary);
		update = JSON.parse(update);
		update.line = "replace";
		delete update._id;
		
		bulk.find(itinerary).replaceOne(update);
		var current: any;
		var expected: boolean = true;
		try{
			bulk.execute();
			current = true;
		} catch(e){
			current = e;
		} finally {
			Assert.equal(current, expected);
			done();
		}
	});
	
	it("should batch remove documents in the collection", (done) => {
		var bulk: IBulk<Itinerary> = collection.initBulk();
		
		var update: any = JSON.stringify(itinerary);
		update = JSON.parse(update);
		update.line = "replace";
		delete update._id;
		
		bulk.find({line: { $in: ["batch", "replace"] } }).remove();
		var current: any;
		var expected: boolean = true;
		try{
			bulk.execute();
			current = true;
		} catch(e){
			current = e;
		} finally {
			Assert.equal(current, expected);
			done();
		}
	});
	
});