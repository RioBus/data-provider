'use strict';
/* global describe, it, before; */
require('co-mocha')(require('mocha'));
const Assert = require('assert');

const base = '../../src';
const BusDownloader = require(`${base}/downloader/busDownloader`);
const Config = require(`${base}/config`);

var urlREGULAR, urlBRT;

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
		Assert.notEqual(data.length, 0);
		done();
	});
	
	it('should download the current BRT buses states', function*(done) {
		var data = yield BusDownloader.fromURL(urlBRT);
		Assert.notEqual(data, undefined);
		Assert.notEqual(data, null);
		Assert.notEqual(data.length, 0);
		done();
	});
});