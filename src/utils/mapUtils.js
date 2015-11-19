'use strict';
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
}
module.exports = MapUtils;