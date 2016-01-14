'use strict';
/* global describe, it, before; */
const Assert = require('assert');

const base = '../../src';
const BusHistory = require(`${base}/model/busHistory`);
const Config = require(`${base}/config`);

var streets;

describe('BusHistory', () => {
	
	before( () => {
        
	});
	
	it('should create a blank timeline from the empty constructor', function(done) {
		var history = new BusHistory();
		Assert.notEqual(history, undefined);
		Assert.notEqual(history, null);
		Assert(history instanceof BusHistory);
		Assert.notEqual(history.timeline, undefined);
		Assert.notEqual(history.timeline, null);
		Assert(history.timeline instanceof Array);
        Assert.equal(history.timeline.length, 0);
        done();
	});
	
	it('should create a timeline from existing timeline', function(done) {
        var oldTimeline = ['A','B'];
		var history = new BusHistory(oldTimeline);
		Assert.notEqual(history, undefined);
		Assert.notEqual(history, null);
		Assert(history instanceof BusHistory);
		Assert.notEqual(history.timeline, undefined);
		Assert.notEqual(history.timeline, null);
		Assert(history.timeline instanceof Array);
        Assert.equal(history.timeline.length, oldTimeline.length);
        for (var i=0; i<history.timeline.length; i++) {
            Assert.deepStrictEqual(history.timeline[i], oldTimeline[i], "Items from original timeline and created timeline do not match");
        }
        done();
	});
    
	it('should add a new item to a timeline', function(done) {
        var itemToAdd = 'X';
        var oldTimeline = ['A','B','C'];
		var history = new BusHistory(oldTimeline);
        history.addStreetToHistory(itemToAdd);
        var lastItem = history.timeline[history.timeline.length-1];
        Assert.deepStrictEqual(lastItem, itemToAdd, "Added item does not match");
        done();
	});
    
	it('should not add a repeated item to a timeline', function(done) {
        var itemToAdd = 'C';
        var oldTimeline = ['A','B','C'];
		var history = new BusHistory(oldTimeline);
        var oldLength = history.timeline.length;
        history.addStreetToHistory(itemToAdd);
        var newLength = history.timeline.length;
        Assert.equal(oldLength, newLength, "Timeline added a repeated item")
        var lastItem = history.timeline[newLength-1];
        Assert.deepStrictEqual(lastItem, itemToAdd, "Last item does not match");
        done();
	});
    
	it('should not add a repeated item to a timeline', function(done) {
        var itemToAdd = 'C';
		var history = new BusHistory();
        history.addStreetToHistory(itemToAdd);
        history.addStreetToHistory(itemToAdd);
        history.addStreetToHistory(itemToAdd);
        history.addStreetToHistory(itemToAdd);
        history.addStreetToHistory(itemToAdd);
        Assert.equal(history.timeline.length, 1, "Timeline added a repeated item")
        var lastItem = history.timeline[history.timeline.length-1];
        Assert.deepStrictEqual(lastItem, itemToAdd, "Last item does not match");
        done();
	});
    
	it('should shift timeline to the maximum size', function(done) {
        var max = Config.historySize;
        var oldTimeline = [];
        for (let i=0; i<max; i++) {
            oldTimeline.push(i);
        }
		var history = new BusHistory(oldTimeline);
        var oldLength = history.timeline.length;
        Assert.equal(oldLength, max);
        var itemToAdd = 'X';
        history.addStreetToHistory(itemToAdd);
        var newLength = history.timeline.length;
        Assert.equal(newLength, max, "Timeline exceeded maximum size")
        var lastItem = history.timeline[newLength-1];
        Assert.deepStrictEqual(lastItem, itemToAdd, "Last item does not match");
        Assert.deepStrictEqual(history.timeline[0], 1, "First item does not match");
        done();
	});
    
});