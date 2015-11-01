/**
 * Describes one spot of the Itinerary of a given line
 * @class {ItinerarySpot}
 */
class ItinerarySpot {

    constructor(latitude, longitude) {
		this.latitude = latitude;
		this.longitude = longitude;
	}
}
module.exports = ItinerarySpot;