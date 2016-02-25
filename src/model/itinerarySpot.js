'use strict';
const Spot = require('./spot');
/**
 * Describes one geolocated itinerary spot
 * @class {ItinerarySpot}
 */
class ItinerarySpot extends Spot {

    constructor(latitude, longitude, returning) {
		super(latitude, longitude);
        this.returning = returning;
	}
}
module.exports = ItinerarySpot;