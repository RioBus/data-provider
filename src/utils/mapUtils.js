'use strict';
const Config   = require('../config');
const request  = require('request');

/**
 * Map helper functions
 * @class {MapUtils}
 */
class MapUtils {

	/**
	 * Calculates the distance between two geolocated spots
	 * @param {Spot} first - A geolocated spot
	 * @param {Spot} second - A geolocated spot
	 * @return {number}
	 */
	static distanceBetween(first, second) {
		const lat1 = first.latitude;
		const lon1 = first.longitude;
		const lat2 = second.latitude;
		const lon2 = second.longitude;
		
		const theta = lon1 - lon2;
		let dist = Math.sin(MapUtils.deg2rad(lat1)) * Math.sin(MapUtils.deg2rad(lat2)) + Math.cos(MapUtils.deg2rad(lat1))
					* Math.cos(MapUtils.deg2rad(lat2)) * Math.cos(MapUtils.deg2rad(theta));
		dist = Math.acos(dist);
		dist = MapUtils.rad2deg(dist);
		dist = dist * 60 * 1.1515 * 1609.344; // meters
		return dist;
	}

	/**
	 * Converts degrees to rads
	 * @param {number} deg - Degrees value
	 * @return {number}
	 */
	static deg2rad(deg) {
		return (deg * Math.PI / 180.0);
	}

	/**
	 * Converts rads to degrees
	 * @param {number} rad - Rad value
	 * @return {number}
	 */
	static rad2deg(rad) {
		return (rad * 180 / Math.PI);
	}
    
    /**
     * Receives a coordinates object with latitude and longitude and a callback that will
     * receive the street name corresponding to the coordinates.
     * @param {object} coordinates - Object containing a latitude and a longitude property
     * @param {function} callback - Function to be called when the operation is finished
     */
    static reverseGeocode(coordinates, callback) {
        MapUtils.reverseGeocodeOSRM(coordinates, callback);
    }

    /**
     * Find the street name using a coordinate using the Open Street Routing Machine API.
     * @param {object} coordinates - Object containing a latitude and a longitude property
     * @param {function} callback - Function to be called when the operation is finished
     */
    static reverseGeocodeOSRM(coordinates, callback) {
        var latlng = coordinates.latitude + ',' + coordinates.longitude;
        request(Config.OSRM.base_url + '/nearest?loc=' + latlng, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
                callback(error, result.name);
            }
            else {
                callback(error, null);
            }
        })
    }
}
module.exports = MapUtils;