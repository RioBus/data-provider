'use strict';
const Config   = require('../config');
const Core     = require('../core');
const MapUtils = require('./mapUtils');
const Spot     = require('../model/spot');

const Cache    = Core.Cache;
const Logger   = Core.LoggerFactory.getRuntimeLogger();

/**
 * Bus helper functions
 * @class {BusUtils}
 */
class BusUtils {

	/**
	 * Calculates if a bus state is returning, stopped or moving forward
	 * @param {string} busOrder - Bus order code
	 * @return {string}
	 */
    static currentPositionState(current, past, startPoint) {
        if(!past || !startPoint.latitude || !startPoint.longitude || !current) return 0;
        const pastPosition = new Spot(past.latitude, past.longitude);
        const currentPosition = new Spot(current.latitude, current.longitude);
        const pastDistance = MapUtils.distanceBetween(startPoint, pastPosition);
        const currentDistance = MapUtils.distanceBetween(startPoint, currentPosition);
        if(currentDistance===pastDistance) return 0;
        else if(currentDistance>pastDistance) return 1;
        else return -1;
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
	 * Parses the bus history data and prepares for operation
	 * @param {string} content - Bus cached content
	 * @param {Spot} startPoint - Itinerary begin spot for the bus line
	 * @return {Object}
	 */
    static prepareHistory(content, startPoint) {
        let history = (content!=='')? JSON.parse(content) : { startPoint: { latitude: null, longitude: null }, timeline: [] };
        if(history.startPoint.latitude===null && history.startPoint.longitude===null && startPoint) history.startPoint = startPoint;
        return history; 
    }

	/**
	 * Checks if the current bus state is contained in the history data
	 * @param {string} content - Current content
	 * @param {Object} timeline - Bus history timeline
	 * @return {boolean}
	 */
    static timelineHasData(content, timeline) {
        return timeline.some( (value, index, data) => { return JSON.stringify(data[index])===JSON.stringify(content); });
    }

	/**
	 * Tries to figure out the current bus state direction (which direction is it going analyzing the history)
	 * @param {Array} status - Bus states
	 * @return {number}
	 */
    static reduceState(states) {
        states = states.reverse();
        const goal = 2;
        let total = 0;
        let current;
        
        for(let state of states) {
            if(!current) {
                current = state;
                total++;
            } else if(state===current) {
                total++;
                if(total===goal) {
                    return current;
                }
            } else if(state!==current) {
                current = state;
                total = 1;
            }
        }
        return 0;
    }
    
	/**
	 * Updates the bus sense field with it's real direction 
	 * @param {string} description - Bus sense description
	 * @param {number} direction - direction identifier
	 * @return {string}
	 */
    static prepareDirection(description, direction) {
        let tmp = 'desconhecido';
        if(direction > 0) tmp = description;
        else if(direction < 0) {
            let tmpDescription = description.split(' X ');
            let aux = tmpDescription[1];
            tmpDescription[1] = tmpDescription[0];
            tmpDescription[0] = aux;
            tmp = tmpDescription.join(' X ');
        }
        return tmp;
    }

	/**
	 * Tries to figure out the sense of the given Bus
	 * @param {Bus} bus - Bus instance
	 * @param {Itinerary} itinerary - Itinerary of the bus line
	 * @return {Bus}
	 */
    static identifySense(bus, itinerary) {
        var max = Config.historySize;
        var tmp = BusUtils.readFromCache(bus.order);
        var startPoint = itinerary.spots[0];
        var sense = itinerary.description;
        var finalState = [];
        
        // Getting the cached information
        var history = BusUtils.prepareHistory(tmp, startPoint); 
        startPoint = new Spot(history.startPoint.latitude, history.startPoint.longitude);
        
        // Preparing current position data
        tmp = { latitude: bus.latitude, longitude: bus.longitude };
        
        // Setting the new position
        if(!BusUtils.timelineHasData(tmp, history.timeline)) history.timeline.push(tmp);
        if(history.timeline.length>max) {
            var overpass = history.timeline.length - max, i = 0;
            while (i++<overpass) history.timeline.shift();
        }
        
        // Setting up the final states
        var past = null;
        history.timeline.forEach((step, index) => {
            var tmpState = BusUtils.currentPositionState(step, past, startPoint);
            finalState.push(tmpState);
            past = step;
        });
        
        // Getting the current punctuation
        var reducedState = BusUtils.reduceState(finalState);
        
        // Updating sense
        bus.sense = BusUtils.prepareDirection(sense, reducedState);
        
        // Updating the cached data
        BusUtils.writeToCache(bus.order, history);
        
        return bus;
    }
    
    /**
     * Finds the occurences of a certain street in the itinerary.
     * @param {string} street - Name of the street (needle)
     * @param {array} streets - Array of street objects of the itinerary
     * @return {array} List of indexes of the matched objects
     */
    static streetInItinerary(street, streets) {
        var matchedIndexes = [];
        for (let i=0; i<streets.length; i++) {
            if (streets[i].location === street) {
                matchedIndexes.push(i);
            }
        }
        return matchedIndexes;
    }
    
    /**
     * Identify direction of the bus from the itinerary matches array.
     * @param {array} matches - Array of indexes of itinerary matches
     * @param {array} streets - Array of street objects of the itinerary
     * @return {number} A number indicating the direction.
     */
    static identifyStateFromMatches(matches, streets) {
        let initialMatch = matches[0];
        let returning = streets[initialMatch].returning;
        
        // Check if there are different states
        for (let i=1; i<matches.length; i++) {
            var match = matches[i];
            // If different directions were found
            if (match.returning !== returning) {
                return 0;
            }
        }
        
        // If it's here, it means all matches are on the same direction
        if (returning) return -1;
        return 1;
    }
    
	/**
	 * Tries to figure out the direction of the given Bus
	 * @param {Bus} bus - Bus instance
	 * @param {Itinerary} itinerary - Itinerary of the bus line
	 * @return {Bus}
	 */
    static* identifyDirection(bus, itinerary) {
        let streets = itinerary.streets;
        
        // Check if the itinerary has information about the streets
        if (!streets || streets.length == 0) {
            Logger.alert(`[${bus.order}] Line ${itinerary.line} does not have street itinerary`);
            bus.sense = "indisponível";
            return bus;
        }
        
        let currentCoordinates = { latitude: bus.latitude, longitude: bus.longitude };
        let currentStreet = yield MapUtils.reverseGeocode(currentCoordinates);
        
        // Check if was able to identify current street
        if (!currentStreet) {
            Logger.alert(`[${bus.order}] Current street could not be identified.`);
            return bus;
        }
        
        Logger.info(`[${bus.order}] Current street: ${currentStreet}`);
        
        // Check if the current street matches the itinerary
        let matches = BusUtils.streetInItinerary(currentStreet, streets);
        if (matches.length == 0) {
            Logger.info(`[${bus.order}] Current street not in itinerary`);
        }
        else {
            Logger.info(`[${bus.order}] Current street got ${matches.length} matches in the itinerary:`);
            
            for (let matchIndex of matches) {
                let match = streets[matchIndex];
                if (!match.returning)
                    Logger.info(`   Going`);
                else 
                    Logger.info(`   Returning`);
            }
            let directionState = BusUtils.identifyStateFromMatches(matches, streets);
            Logger.info(`[${bus.order}] State is ${directionState}`);
            bus.sense = BusUtils.prepareDirection(itinerary.description, directionState);
        }
        // bus.sense = "xixicoco";
        // var max = Config.historySize;
        // var tmp = BusUtils.readFromCache(bus.order);
        // var finalState = [];
        
        
        // // Getting the cached information
        // var history = BusUtils.prepareHistory(tmp, startPoint); 
        // startPoint = new Spot(history.startPoint.latitude, history.startPoint.longitude);
        
        // // Preparing current position data
        // tmp = { latitude: bus.latitude, longitude: bus.longitude };
        
        // // Setting the new position
        // if(!BusUtils.timelineHasData(tmp, history.timeline)) history.timeline.push(tmp);
        // if(history.timeline.length>max) {
        //     var overpass = history.timeline.length - max, i = 0;
        //     while (i++<overpass) history.timeline.shift();
        // }
        
        // // Setting up the final states
        // var past = null;
        // history.timeline.forEach((step, index) => {
        //     var tmpState = BusUtils.currentPositionState(step, past, startPoint);
        //     finalState.push(tmpState);
        //     past = step;
        // });
        
        // // Getting the current punctuation
        // var reducedState = BusUtils.reduceState(finalState);
        
        // // Updating sense
        // bus.sense = BusUtils.prepareDirection(sense, reducedState);
        
        // // Updating the cached data
        // BusUtils.writeToCache(bus.order, history);
        
        return bus;
    }
}
module.exports = BusUtils;