'use strict';
/* global describe, it, before; */
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
	
	it('should download the current REGULAR buses states', function*() {
		list = yield BusDownloader.fromURL(urlREGULAR);
		Assert.notEqual(list, undefined);
		Assert.notEqual(list, null);
		Assert(list instanceof Array);
		Assert(list[0] instanceof Bus);
	});
	
	it('should download the current BRT buses states', function*() {
		var data = yield BusDownloader.fromURL(urlBRT);
		Assert.notEqual(data, undefined);
		Assert.notEqual(data, null);
		Assert(data instanceof Array);
		Assert(data[0] instanceof Bus);
	});
});