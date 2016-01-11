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
	
	// it('should not identify the state from a history with one weak item', function(done) {
    //     var shortHistory = new BusHistory(['A']);
    //     var state = BusHistoryUtils.identifyStateFromHistory(shortHistory, streets);
	// 	Assert.notEqual(state, undefined);
	// 	Assert.notEqual(state, null);
    //     Assert.deepStrictEqual(state, 0, "Should not be able to identify history");
    //     done();
	// });
    
	it('should identify if a timeline contains an empty sequence', function(done) {
        var sequence = [];
        var timeline = ['A','B','C','A'];
        var matches = BusHistoryUtils.timelineContainsSequence(timeline, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 0, "Should be able to find zero matches");
        done();
	});
    
	it('should identify if a timeline contains an existing sequence with one item', function(done) {
        var sequence = ['A'];
        var timeline = ['A','B','C','A'];
        var matches = BusHistoryUtils.timelineContainsSequence(timeline, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 2, "Should be able to find 1 match");
        done();
	});
    
	it('should identify if a timeline contains an existing sequence with many items ocurring once', function(done) {
        var sequence = ['A','B'];
        var timeline = ['A','B','C','A'];
        var matches = BusHistoryUtils.timelineContainsSequence(timeline, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 1, "Should be able to find 1 match");
        done();
	});
    
	it('should identify if a timeline contains an existing sequence with many items ocurring many times', function(done) {
        var sequence = ['A','B'];
        var timeline = ['A','B','C','A','B','D','A','E','A','B','F','A'];
        var matches = BusHistoryUtils.timelineContainsSequence(timeline, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 3, "Should be able to find 3 matches");
        done();
	});
    
	it('should identify if a timeline contains an existing non-continuous sequence', function(done) {
        var sequence = ['A','B'];
        var timeline = ['A','C','B','A'];
        var matches = BusHistoryUtils.timelineContainsSequence(timeline, sequence);
		Assert.notEqual(matches, undefined);
        Assert.deepStrictEqual(matches, 1, "Should be able to find 1 match");
        done();
	});
    
});