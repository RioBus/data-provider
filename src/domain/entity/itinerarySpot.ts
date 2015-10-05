import IGeolocated = require("../../common/iGeolocated");

/**
 * Describes one spot of the Itinerary of a given line
 * @class Itinerary
 * @constructor
 */
class ItinerarySpot implements IGeolocated {

    public constructor(private latitude: number, private longitude: number) {}
	
	public getLatitude(): number {
		return this.latitude;
	}
	
	public getLongitude(): number {
		return this.longitude;
	}
}
export = ItinerarySpot;