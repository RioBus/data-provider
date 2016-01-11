'use strict';
/* global describe, it, before; */
const Assert = require('assert');

const base = '../../src';
const BusUtils = require(`${base}/utils/busUtils`);
const Config = require(`${base}/config`);

var streets;

describe('BusUtils', () => {
	
	before( () => {
		streets = [
            {
                location: 'A',
                returning: false  
            },
            {
                location: 'B',
                returning: false  
            },
            {
                location: 'C',
                returning: false  
            },
            {
                location: 'A',
                returning: false  
            },
            {
                location: 'D',
                returning: false  
            },
            {
                location: 'E',
                returning: true  
            },
            {
                location: 'F',
                returning: true  
            },
            {
                location: 'E',
                returning: true  
            },
            {
                location: 'A',
                returning: true  
            }
        ];
	});
	
	it('should identify if a street is part of the itinerary', function(done) {
		var matches = BusUtils.streetInItinerary('A', streets);
		Assert.notEqual(matches, undefined);
		Assert.notEqual(matches, null);
		Assert(matches instanceof Array);
        Assert.equal(matches.length, 3)
		Assert.equal(matches[0], 0);
		Assert.equal(matches[1], 3);
		Assert.equal(matches[2], 8);
        done();
	});
});