'use strict';
/* global describe, it, before; */
require('co-mocha')(require('mocha'));
const Assert = require('assert');

const base = '../../src';
const Itinerary = require(`${base}/model/itinerary`);
const ItineraryDownloader = require(`${base}/downloader/itineraryDownloader`);

describe('ItineraryDownloader', () => {
	
	it('should download the itinerary to line 485', function*(done) {
		var data = yield ItineraryDownloader.fromLine('485');
		Assert.notEqual(data, null);
		Assert.notEqual(data, undefined);
		Assert(data instanceof Itinerary);
		done();
	});
});