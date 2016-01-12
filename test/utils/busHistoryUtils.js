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
        // streets = [A,B,C,B,A,D | E,F,E,A]
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
            }
        ];
        
        var oldTimeline = ['F,E,A'];        
        history = new BusHistory(oldTimeline);
	});
	
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
        var shortHistory = new BusHistory(['A','B']);
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
        var shortHistory = new BusHistory(['F','A']); // the perfect sequence would be ABC
        var state = BusHistoryUtils.identifyStateFromHistory(shortHistory, streets);
        Assert.deepStrictEqual(state, -1, "Should be able to identify state as returning");
        done();
	});
    
	it('should identify if a itinerary contains an empty sequence', function(done) {
        var sequence = [];
        var itinerary = ['A','B','C','A'];
        var matches = BusHistoryUtils.itineraryContainsSequence(itinerary, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 0, "Should be able to find zero matches");
        done();
	});
    
	it('should identify if a itinerary contains an existing sequence with one item', function(done) {
        var sequence = ['A'];
        var itinerary = ['A','B','C','A'];
        var matches = BusHistoryUtils.itineraryContainsSequence(itinerary, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 2, "Should be able to find 1 match");
        done();
	});
    
	it('should identify if a itinerary contains an existing sequence with many items ocurring once', function(done) {
        var sequence = ['A','B'];
        var itinerary = ['A','B','C','A'];
        var matches = BusHistoryUtils.itineraryContainsSequence(itinerary, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 1, "Should be able to find 1 match");
        done();
	});
    
	it('should identify if a itinerary contains an existing sequence with many items ocurring many times', function(done) {
        var sequence = ['A','B'];
        var itinerary = ['A','B','C','A','B','D','A','E','A','B','F','A'];
        var matches = BusHistoryUtils.itineraryContainsSequence(itinerary, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 3, "Should be able to find 3 matches");
        done();
	});
    
	it('should identify if a itinerary contains an existing non-continuous sequence', function(done) {
        var sequence = ['A','B'];
        var itinerary = ['A','C','B','A'];
        var matches = BusHistoryUtils.itineraryContainsSequence(itinerary, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 1, "Should be able to find 1 match");
        done();
	});
    
});