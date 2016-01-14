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
        if (this.timeline[this.timeline.length-1] === street) return false;
        
        this.timeline.push(street);
        if (this.timeline.length>max) {
            while (this.timeline.length > max) this.timeline.shift();
        }
        
        return true;
    }
    
}
module.exports = BusHistory;