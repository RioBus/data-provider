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
        
        // if (queryTimeline.length > 0) {
        //    itinerary contains queryTimeline and all matches are going?
        //       return 1
        //    itinerary contains queryTimeline and all matches are returning?
        //       return -1
        //    else
        //       continue... [inconclusive]
        // else
        //    continue... [query is empty, add first element and try]      
        if (queryTimeline.length > 0) {
            var itinerarySequenceMatches = BusHistoryUtils.itineraryContainsSequence(streets, queryTimeline);
            if (itinerarySequenceMatches.count > 0) {
                if (itinerarySequenceMatches.directions == 1) return 1;
                else if (itinerarySequenceMatches.directions == -1) return -1;
                // else console.log('Matching ' + queryTimeline + ' found directions ' + itinerarySequenceMatches.directions)
            }
        }
        if (timeline.length > 0) {      
            queryTimeline.push(timeline.pop());
            var possibleState = BusHistoryUtils.identifyStateFromHistory(history, streets, queryTimeline);
                return possibleState;
        }
        
        return 0;
    }
    
    /**
     * Gets number of times a sequence occurs in a itinerary. This can be a
     * continuous or a non-continuous sequence.
     * @param {array} itinerary - Array of streets from the itinerary (haystack)
     * @param {array} sequence - Sequence we are trying to find (needle)
     * @return {Object} An object with the count of matches and a summary of the directions found
     */
    static itineraryContainsSequence(itinerary, sequence) {
        var matches = {
            count: 0,
            directions: 0 // -1: returning, 1: going, 2:both
        };
        if (sequence.length == 0) return matches;
        var lastIndex = -1;
        while (true) {
            for (var i=0; i<sequence.length; i++) {
                var item = sequence[i];
                var index = BusHistoryUtils.indexOfStreetInItinerary(item, itinerary, lastIndex+1);
                if (index > lastIndex) {
                    lastIndex = index;
                    
                    // If it's the last item of the sequence, check its direction
                    if (i == sequence.length-1) {
                        var foundDirection = itinerary[index].returning ? -1 : 1;
                        if (matches.directions == 0) matches.directions = foundDirection;
                        else if (matches.directions != foundDirection) matches.directions = 2;
                    }
                }
                else {
                    return matches;
                }
            }
            matches.count++;
        }
        return matches;
    }
    
    /**
     * Returns the index of the first occurence of a street in a itinerary array
     * starting from index defined by startAt. This is similar to Array.indexOf()
     * but without support for negative values for startAt.
     * @param {string} street - Name of the street (needle)
     * @param {array} itinerary - Array of streets from the itinerary (haystack)
     * @param {number} startAt - Minimum index. Default: 0
     */
    static indexOfStreetInItinerary(street, itinerary, startAt) {
        if (!startAt || startAt < 0) startAt = 0;
        for (var i=startAt; i<itinerary.length; i++) {
            if (itinerary[i].location === street) {
                return i;
            }
        }
        return -1;
    }
}
module.exports = BusHistoryUtils;