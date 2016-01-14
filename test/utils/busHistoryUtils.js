'use strict';
/* global describe, it, before; */
const Assert = require('assert');

const base = '../../src';
const BusHistory = require(`${base}/model/busHistory`);
const BusHistoryUtils = require(`${base}/utils/busHistoryUtils`);
const Config = require(`${base}/config`);

var streets, history;

describe('BusHistoryUtils', () => {
	
	before( () => {
        // streets = [A,B,C,B,A,D | E,F,E,A,B,A]
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
                location: 'B',
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
            },
            {
                location: 'B',
                returning: true  
            },
            {
                location: 'A',
                returning: true  
            }
        ];
        
        var oldTimeline = ['F,E,A'];        
        history = new BusHistory(oldTimeline);
	});
    
    
    // identifyStateFromHistory
	
	it('should not identify the state from a history with one weak item', function(done) {
        var shortHistory = new BusHistory(['A']);
        var state = BusHistoryUtils.identifyStateFromHistory(shortHistory, streets);
        Assert.deepStrictEqual(state, 0, "Should not be able to identify state");
        done();
	});
	
	it('should not identify the state from a history with a non existing item', function(done) {
        var shortHistory = new BusHistory(['X']);
        var state = BusHistoryUtils.identifyStateFromHistory(shortHistory, streets);
        Assert.deepStrictEqual(state, 0, "Should not be able to identify state");
        done();
	});
    
	it('should not identify the state from a history with non existing items', function(done) {
        var shortHistory = new BusHistory(['A','X','B']);
        var state = BusHistoryUtils.identifyStateFromHistory(shortHistory, streets);
        Assert.deepStrictEqual(state, 0, "Should not be able to identify state");
        done();
	});
    
	it('should identify the state as going with a perfect match', function(done) {
        var shortHistory = new BusHistory(['B','C']);
        var state = BusHistoryUtils.identifyStateFromHistory(shortHistory, streets);
        Assert.deepStrictEqual(state, 1, "Should be able to identify state as going");
        done();
	});
    
	it('should identify the state as returning with a perfect match', function(done) {
        var shortHistory = new BusHistory(['E','F']);
        var state = BusHistoryUtils.identifyStateFromHistory(shortHistory, streets);
        Assert.deepStrictEqual(state, -1, "Should be able to identify state as returning");
        done();
	});
    
	it('should identify the state as going with a match skipping one entry', function(done) {
        var shortHistory = new BusHistory(['A','C']); // the perfect sequence would be ABC
        var state = BusHistoryUtils.identifyStateFromHistory(shortHistory, streets);
        Assert.deepStrictEqual(state, 1, "Should be able to identify state as going");
        done();
	});
    
	it('should identify the state as returning with a match skipping one entry', function(done) {
        var shortHistory = new BusHistory(['F','A']); // the perfect sequence would be FEA
        var state = BusHistoryUtils.identifyStateFromHistory(shortHistory, streets);
        Assert.deepStrictEqual(state, -1, "Should be able to identify state as returning");
        done();
	});
    
    
    // itineraryContainsSequence
    
	it('should identify if a itinerary contains an empty sequence', function(done) {
        var sequence = [];
        var matches = BusHistoryUtils.itineraryContainsSequence(streets, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches.count, 0, "Should be able to find zero matches");
        Assert.deepStrictEqual(matches.directions, 0, "Found direction should be 0");
        done();
	});
    
	it('should identify if a itinerary contains an existing sequence with one item', function(done) {
        var sequence = ['A'];
        var matches = BusHistoryUtils.itineraryContainsSequence(streets, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches.count, 4, "Should be able to find 4 matches of A");
        Assert.deepStrictEqual(matches.directions, 2, "Should have found two directions");
        done();
	});
    
	it('should identify if a itinerary contains an existing sequence with many items ocurring once', function(done) {
        var sequence = ['B','C'];
        var matches = BusHistoryUtils.itineraryContainsSequence(streets, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches.count, 1, "Should be able to find 1 match");
        Assert.deepStrictEqual(matches.directions, 1, "Should have found direction as going");
        done();
	});
    
	it('should identify if a itinerary contains an existing sequence with many items ocurring many times', function(done) {
        var sequence = ['A','B'];
        var matches = BusHistoryUtils.itineraryContainsSequence(streets, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches.count, 2, "Should be able to find 2 matches");
        Assert.deepStrictEqual(matches.directions, 2, "Should have found two directions");
        done();
	});
    
	it('should identify if a itinerary contains an existing non-continuous sequence', function(done) {
        var sequence = ['D','F'];
        var matches = BusHistoryUtils.itineraryContainsSequence(streets, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches.count, 1, "Should be able to find 1 match");
        Assert.deepStrictEqual(matches.directions, -1, "Should have found direction as returning");
        done();
	});
    
    
    // indexOfStreetInItinerary
    
	it('should not identify index of a street that does not exist in itinerary', function(done) {
        var street = 'Y';
        var index = BusHistoryUtils.indexOfStreetInItinerary(street, streets, 0);
        Assert.deepStrictEqual(index, -1, "Should not be able to find");
        done();
	});

	it('should identify index of a street in itinerary', function(done) {
        var street = 'A';
        var index = BusHistoryUtils.indexOfStreetInItinerary(street, streets, 0);
		Assert.notEqual(index, -1, "Could not find the index");
        Assert.deepStrictEqual(index, 0, "Should be able to find at index 0");
        done();
	});
    
	it('should identify index of a street in itinerary', function(done) {
        var street = 'A';
        var index = BusHistoryUtils.indexOfStreetInItinerary(street, streets, 1);
		Assert.notEqual(index, -1, "Could not find the index");
        Assert.deepStrictEqual(index, 4, "Should be able to find at index 4");
        done();
	});
    
});