'use strict';
const Config   = require('../config');

var max = Config.historySize;

/**
 * Bus history helper functions
 * @class {BusHistory}
 */
class BusHistory {
    constructor(timeline) {
        this.timeline = timeline || [];
    }
    
    addStreetToHistory(street) {
        // Ignore if the item is the same as the previous one added
        if (this.timeline[this.timeline.length-1] === street) return;
        
        this.timeline.push(street);
        if (this.timeline.length>max) {
            while (this.timeline.length > max) this.timeline.shift();
        }
    }
    
    /**
     * Gets number of times a sequence occurs in a timeline. This can be a
     * continuous or a non-continuous sequence.
     * @param {array} sequence - Sequence we are trying to find (needle)
     */
    occurrencesOfSequence(sequence) {
        if (sequence.length == 0 || this.timeline.length == 0 || sequence.length > this.timeline.length) return 0;
        var lastIndex = -1;
        var matches = 0;
        while (true) {
            for (var item of sequence) {
                var index = this.timeline.indexOf(item, lastIndex+1);
                if (index > lastIndex) {
                    lastIndex = index;
                } else {
                    return matches;
                }
            }
            matches++;
        }
        return matches;
    }
}
module.exports = BusHistory;