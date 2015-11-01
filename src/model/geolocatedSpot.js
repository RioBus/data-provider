'use strict';
/**
 * Describes one spot of the Itinerary of a given line
 * @class {ItinerarySpot}
 */
class GeolocatedSpot {

    constructor(latitude, longitude) {
		this.latitude = latitude;
		this.longitude = longitude;
	}
}
module.exports = GeolocatedSpot;