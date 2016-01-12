'use strict';
const BusHistory = require('../model/busHistory');
const Config   = require('../config');
const Core     = require('../core');

const Cache    = Core.Cache;
const Logger   = Core.LoggerFactory.getRuntimeLogger();

/**
 * BusHistory helper functions
 * @class {BusHistoryUtils}
 */
class BusHistoryUtils {
    /**
     * Identify direction of the bus from the bus history.
     * @param {BusHistory} history - The bus history
     * @param {array} streets - Array of street objects of the itinerary
     * @return {number} A number indicating the direction
     */
    static identifyStateFromHistory(history, streets, usedTimeline) {
        var timeline = history.timeline;
        var queryTimeline = usedTimeline || [];
        
        if (timeline.length > 0) {
            queryTimeline.push(timeline.pop());
            var possibleState = BusHistoryUtils.identifyStateFromHistory(history, streets, queryTimeline);
            if (possibleState != 0) return possibleState;
        }
        
        return 0;
    }
    
    /**
     * Gets number of times a sequence occurs in a itinerary. This can be a
     * continuous or a non-continuous sequence.
     * @param {array} itinerary - Array of streets from the itinerary (haystack)
     * @param {array} sequence - Sequence we are trying to find (needle)
     */
    static itineraryContainsSequence(itinerary, sequence) {
        if (sequence.length == 0) return 0;
        var lastIndex = -1;
        var matches = 0;
        while (true) {
            for (var item of sequence) {
                var index = itinerary.indexOf(item, lastIndex+1);
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
module.exports = BusHistoryUtils;