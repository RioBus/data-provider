'use strict';
/* global describe, it, before; */
const Assert = require('assert');

const base = '../../src';
const Bus = require(`${base}/model/bus`);
const BusDownloader = require(`${base}/downloader/busDownloader`);
const Config = require(`${base}/config`);


describe('BusDownloader', () => {
	
	let urlREGULAR, urlREGULAR2, urlBRT, list;
	
	before( () => {
		let urlConfig = Config.provider;
		urlREGULAR = `http://${urlConfig.host}${urlConfig.path.bus.REGULAR}`;
		urlREGULAR2 = `http://${urlConfig.host}${urlConfig.path.bus['REGULAR-NEW']}`;
		urlBRT = `http://${urlConfig.host}${urlConfig.path.bus.BRT}`;
	});
	
	it('should download the current REGULAR buses states', function*() {
		try {
			list = yield BusDownloader.fromURL(urlREGULAR);
			Assert.notEqual(list, undefined);
			Assert.notEqual(list, null);
			Assert(list instanceof Array);
			for (let element of list) {
				Assert(element instanceof Bus, "Downloaded element should be of type Bus");
			}
		} catch (e) {
			Assert(true);
		}
	});
	
	it('should download the current REGULAR-NEW buses states', function*() {
		try {
			list = yield BusDownloader.fromURL(urlREGULAR2);
			Assert.notEqual(list, undefined);
			Assert.notEqual(list, null);
			Assert(list instanceof Array);
			for (let element of list) {
				Assert(element instanceof Bus, "Downloaded element should be of type Bus");
			}
		} catch(e) {
			Assert(true);
		}
	});
	
	it('should download the current BRT buses states', function*() {
		try {
			list = yield BusDownloader.fromURL(urlBRT);
			Assert.notEqual(list, undefined);
			Assert.notEqual(list, null);
			Assert(list instanceof Array);
			for (let element of list) {
				Assert(element instanceof Bus, "Downloaded element should be of type Bus");
			}
		} catch(e) {
			Assert(true);
		}
	});
});