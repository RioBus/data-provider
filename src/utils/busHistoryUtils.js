'use strict';
const BusHistory = require('../model/busHistory');
const Config     = require('../config');
const Core       = require('../core');

const Cache      = Core.Cache;
const Logger     = Core.LoggerFactory.getRuntimeLogger();

var historyArchive = {};

/**
 * BusHistory helper functions
 * @class {BusHistoryUtils}
 */
class BusHistoryUtils {
    /**
     * Returns a BusHistory for the specified bus order, reading from file cache
     * or creating a new one if it doesn't exist.
     * @param {string} order - Bus order code
     * @return {BusHistory} A BusHistory object for the bus containing previous
     * timeline if available.
     */
    static historyForBus(order) {
        var history = historyArchive[order];
        if (!history) {
            Logger.info(`[${order}] History for bus ${order} not found. Creating one...`);
            var cachedHistoryJSON = BusHistoryUtils.readFromCache(order);
            if (cachedHistoryJSON !== '') {
                var cachedHistory = JSON.parse(cachedHistoryJSON);
                Logger.info(`[${order}] History for bus ${order} found on cache: ${cachedHistoryJSON}`);
                history = new BusHistory(cachedHistory.timeline, cachedHistory.directionState);
            }
            else {
                history = new BusHistory();
            }
            historyArchive[order] = history;
        }
        return history;
    }
    
    /**
	 * Reads a bus history data from cache
	 * @param {string} busOrder - Bus order code
	 * @return {string}
	 */
    static readFromCache(busOrder) {
        try { return new Cache(busOrder).retrieve(); }
        catch (e) { return ''; }
    }

	/**
	 * Writes a bus history data to cache
	 * @param {string} busOrder - Bus order code
	 * @param {string} content - Content to be cached
	 * @return {void}
	 */
    static writeToCache(busOrder, content) {
        try {
            new Cache(busOrder).write(JSON.stringify(content));
        } catch (e) {
            Logger.error(e.stack);
        }
    }
    
    /**
     * Identify direction of the bus from the bus history.
     * @param {BusHistory} history - The bus history
     * @param {array} streets - Array of street objects of the itinerary
     * @return {number} A number indicating the direction
     */
    static identifyStateFromHistory(history, streets, usedTimeline) {
        // If this is the first call (without a usedTimeline param), copy the timeline and
        // create a new BusHistory that it won't be modified by other calls.
        if (!usedTimeline) {
            var copiedHistory = new BusHistory(history.timeline.slice(0));
            history = copiedHistory;
        }
        var timeline = history.timeline;
        var queryTimeline = usedTimeline || [];
        
        if (queryTimeline.length > 0) {
            var itinerarySequenceMatches = BusHistoryUtils.itineraryContainsSequence(streets, queryTimeline);
            if (itinerarySequenceMatches.count > 0) {
                // all matches are going?
                if (itinerarySequenceMatches.directions == 1) return 1;
                // all matches are returning?
                else if (itinerarySequenceMatches.directions == -1) return -1;
                // if found both directions, it was inconclusive, so continue
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