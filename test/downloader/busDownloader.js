'use strict';
/* global describe, it, before; */
require('co-mocha')(require('mocha'));
const Assert = require('assert');

const base = '../../src';
const Bus = require(`${base}/model/bus`);
const BusDownloader = require(`${base}/downloader/busDownloader`);
const Config = require(`${base}/config`);

var urlREGULAR, urlBRT, list;

describe('BusDownloader', () => {
	
	before( () => {
		let urlConfig = Config.provider;
		urlREGULAR = `http://${urlConfig.host}${urlConfig.path.bus.REGULAR}`;
		urlBRT = `http://${urlConfig.host}${urlConfig.path.bus.BRT}`;
	});
	
	it('should download the current REGULAR buses states', function*(done) {
		var data = yield BusDownloader.fromURL(urlREGULAR);
		Assert.notEqual(data, undefined);
		Assert.notEqual(data, null);
		Assert(data instanceof Array);
		Assert(data[0] instanceof Bus);
		list = data;
		done();
	});
	
	it('should have the number count of docs in the array equal to the number of orders', (done) => {
		const distinctOrders = [];
		for(let bus of list) {
			if(distinctOrders.indexOf(bus.order)>-1) continue;
			distinctOrders.push(bus.order);
		}
		Assert.equal(distinctOrders.length, list.length);
		done();
	});
	
	it('should download the current BRT buses states', function*(done) {
		var data = yield BusDownloader.fromURL(urlBRT);
		Assert.notEqual(data, undefined);
		Assert.notEqual(data, null);
		Assert(data instanceof Array);
		Assert(data[0] instanceof Bus);
		done();
	});
});