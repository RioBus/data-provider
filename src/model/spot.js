'use strict';
/**
 * Describes one geolocated spot
 * @class {Spot}
 */
class Spot {

    constructor(latitude, longitude, returning) {
		this.latitude = latitude;
		this.longitude = longitude;
        this.returning = returning;
	}
}
module.exports = Spot;