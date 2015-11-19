'use strict';
/* global describe, it, before, global, __dirname, after; */
const base = `${__dirname}/../../src`;

const Assert = require('assert');
const Database = require(`${base}/core`).Database;
const Bus = require(`${base}/model/bus`);
const BusDAO = require(`${base}/dao/busDAO`);

var dao, saved;

describe('BusDAO', () => {
	
	before(function*() {
		let conn = yield Database.connect();
		yield conn.collection('bus').remove({});
		yield conn.collection('bus_history').remove({});
		dao = new BusDAO(conn);
	});
	
	it('should insert data', function*() {
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
	});
	
	after(function*() {
		yield saved[0].remove();
		yield saved[1].remove();
	});
});