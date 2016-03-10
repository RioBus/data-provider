'use strict';
const BusHistory     = require('../model/busHistory');
const BusHistoryUtils = require('./busHistoryUtils');
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
	 * Tries to figure out the direction of the given Bus
	 * @param {Bus} bus - Bus instance
	 * @param {Itinerary} itinerary - Itinerary of the bus line
	 * @return {Bus}
	 */
    static* identifyDirection(bus, itinerary) {
        let streets = itinerary.streets;
        
        // Check if the itinerary has information about the streets
        if (!streets || streets.length == 0) {
            // Logger.alert(`[${bus.order}] Line ${itinerary.line} does not have street itinerary`);
            bus.sense = "indisponível";
            return bus;
        }
        
        let currentCoordinates = { latitude: bus.latitude, longitude: bus.longitude };
        let currentStreet = yield MapUtils.streetNameFromCoordinates(currentCoordinates);
        let history = BusHistoryUtils.historyForBus(bus.order);
        var directionState;
        
        // Check if was able to identify current street
        if (!currentStreet) {
            // Logger.alert(`[${bus.order}] Current street could not be identified (${bus.latitude},${bus.longitude})`);
            
            // Use the last identified direction
            directionState = history.directionState;
            // Logger.info(`[${bus.order}] Using last direction from cache: ${directionState}`);
            bus.sense = BusUtils.prepareDirection(itinerary.description, directionState);
            return bus;
        }
        
        // Check if the current street matches the itinerary
        let matches = BusUtils.streetInItinerary(currentStreet, streets);
        if (matches.length == 0) {
            // Logger.alert(`[${bus.order}] Current street not in itinerary (${currentStreet})`);
            
            // Use the last identified direction
            directionState = history.directionState;
            // Logger.info(`[${bus.order}] Using last direction from cache: ${directionState}`);
            bus.sense = BusUtils.prepareDirection(itinerary.description, directionState);
        }
        else {
            var timelineModified = history.addStreetToHistory(currentStreet);
            
            // Try to identify direction matching history to itinerary
            directionState = BusHistoryUtils.identifyStateFromHistory(history, streets);
            if (directionState != 0) {
                // Logger.info(`[${bus.order}] Using identified direction from history: ${directionState}`);
                
                // If a new direction was identified, set flag to update history
                if (directionState != history.directionState) {
                    history.directionState = directionState;
                    timelineModified = true;
                }
            }
            // If failed to identify a direction, use the last one identified
            else {
                directionState = history.directionState;
                // Logger.alert(`[${bus.order}] Could not identify direction from history`);
                // Logger.info(`[${bus.order}] Using last direction from cache: ${directionState}`);
            }
            
            bus.sense = BusUtils.prepareDirection(itinerary.description, directionState);
            
            // If the history has been modified, write it to cache
            if (timelineModified) {
                BusHistoryUtils.writeToCache(bus.order, history);
                //Logger.info(`[${bus.order}] Updated bus history cache (timeline or direction updated)`);
            }
        }
        
        return bus;
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
    
}
module.exports = BusUtils;