'use strict';
/* global describe, it, before; */
const Assert = require('assert');

const base = '../../src';
const MapUtils = require(`${base}/utils/mapUtils`);

var streets;

describe('MapUtils', () => {
	
	before( () => {
        
	});
	
	it('should be able to identify the street name from a valid coordinate', function*() {
        let coordinates = { latitude: -22.960905, longitude: -43.208759 };
		let streetName = yield MapUtils.streetNameFromCoordinates(coordinates);
        Assert.deepStrictEqual(streetName, "Rua Jardim Botânico");
	});
    
});