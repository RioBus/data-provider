'use strict';
/* global describe, it, before, global, __dirname, after; */
require('co-mocha')(require('mocha'));
const base = `${__dirname}/../../src`;

const Assert = require('assert');
const Database = require(`${base}/core`).Database;
const Bus = require(`${base}/model/bus`);
const BusDAO = require(`${base}/dao/busDAO`);

var dao, saved;

describe('BusDAO', () => {
	
	before(function*() {
		let conn = yield Database.connect();
		dao = new BusDAO(conn);
	});
	
	it('should insert data', function*(done) {
		let data = new Bus('line', 'order', 0, 0, 23, 45, (new Date()).toDateString(), 'sense');
		const common = yield dao.commonSave(data);
		const history = yield dao.historySave(data);
		
		Assert.equal(common.line, data.line);
		Assert.equal(history.line, data.line);
		
		Assert.equal(common.order, data.order);
		Assert.equal(history.order, data.order);
		
		Assert.equal(common.latitude, data.latitude);
		Assert.equal(history.latitude, data.latitude);
		
		Assert.equal(common.longitude, data.longitude);
		Assert.equal(history.longitude, data.longitude);
		
		Assert.equal(common.timestamp, data.timestamp);
		Assert.equal(history.timestamp, data.timestamp);
		
		Assert.equal(common.sense, data.sense);
		Assert.equal(history.sense, data.sense);
		
		Assert.notEqual(common._id, undefined);
		Assert.notEqual(history._id, undefined);
		saved = [ common, history ];
		done();
	});
	
	after(function*() {
		yield saved[0].remove();
		yield saved[1].remove();
	});
});