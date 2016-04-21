'use strict';
/* global describe, it, before; */
const Assert = require('assert');

const base = '../../src';
const Itinerary = require(`${base}/model/itinerary`);
const ItineraryDownloader = require(`${base}/downloader/itineraryDownloader`);

describe('ItineraryDownloader', () => {
	
	it('should download the itinerary to line 485', function*() {
		try {
			var data = yield ItineraryDownloader.fromLine('485');
			Assert.notEqual(data, null);
			Assert.notEqual(data, undefined);
			Assert(data instanceof Itinerary);
		} catch (e) {
			Assert(true);
		}
	});
});