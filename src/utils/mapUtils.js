'use strict';

class MapUtils {

	static distanceBetween(first, second) {
		var lat1 = first.getLatitude();
		var lon1 = first.getLongitude();
		var lat2 = second.getLatitude();
		var lon2 = second.getLongitude();
		
		var theta = lon1 - lon2;
		var dist = Math.sin(MapUtils.deg2rad(lat1)) * Math.sin(MapUtils.deg2rad(lat2)) + Math.cos(MapUtils.deg2rad(lat1))
					* Math.cos(MapUtils.deg2rad(lat2)) * Math.cos(MapUtils.deg2rad(theta));
		dist = Math.acos(dist);
		dist = MapUtils.rad2deg(dist);
		dist = dist * 60 * 1.1515 * 1609.344; // meters
		return dist;
	}
	
	static deg2rad(deg) {
		return (deg * Math.PI / 180.0);
	}
	
	static rad2deg(rad) {
		return (rad * 180 / Math.PI);
	}
}
module.exports = MapUtils;