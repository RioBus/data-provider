'use strict';
const Config   = require('../config');
const Core     = require('../core');
const Http     = Core.Http;
const request  = require('request');

const logger   = Core.LoggerFactory.getRuntimeLogger();

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
     * @return {Promise}
     */
    static reverseGeocode(coordinates) {
        return MapUtils.reverseGeocodeOSRM(coordinates);
    }

    /**
     * Find the street name using a coordinate using the Open Street Routing Machine API.
     * @param {object} coordinates - Object containing a latitude and a longitude property
     * @param {function} callback - Function to be called when the operation is finished
     * @return {Promise}
     */
    static reverseGeocodeOSRM(coordinates, callback) {
        var latlng = coordinates.latitude + ',' + coordinates.longitude;
        var url = Config.OSRM.base_url + '/nearest?loc=' + latlng;
        
        return Http.get(url).then( (response) => {
            const status = response.statusCode;
            switch(status) {
                case 200:
                    logger.info(`[${url}] -> 200 OK`);
                    return response.body.name;
                    break;
                default:
                    logger.error(`[${url}] -> ${status} ERROR`);
                    break;
            }
            return null;
        });
    }
}
module.exports = MapUtils;