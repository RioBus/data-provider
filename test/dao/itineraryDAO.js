'use strict';
/* global describe, it, before, global, __dirname, after; */
require('co-mocha')(require('mocha'));
const base = `${__dirname}/../../src`;

const Assert = require('assert');
const Database = require(`${base}/core`).Database;
const Itinerary = require(`${base}/model/itinerary`);
const ItineraryDAO = require(`${base}/dao/itineraryDAO`);

var dao, saved;

describe('ItineraryDAO', () => {
	
	before(function*() {
		let conn = yield Database.connect();
		yield conn.collection('itinerary').remove({});
		dao = new ItineraryDAO(conn);
	});
	
	it('should insert data', function*(done) {
		let data = new Itinerary('line', 'description', 'agency', 'keywords');
		const response = yield dao.save(data);
		Assert.equal(response.line, data.line);
		Assert.equal(response.description, data.description);
		Assert.equal(response.agency, data.agency);
		Assert.equal(response.keywords, data.keywords);
		Assert.notEqual(response._id, undefined);
		saved = response;
		done();
	});
	
	it('should retrieve the recently inserted data', function*(done) {
		const response = yield dao.getAll();
		Assert.equal(response.length, 1);
		done();
	});
	
	after(function*() {
		yield saved.remove();
	});
});