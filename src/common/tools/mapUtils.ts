import IGeolocated = require("../iGeolocated");

class MapUtils {

	public static distanceBetween(first: IGeolocated, second: IGeolocated): number {
		var lat1: number = first.getLatitude();
		var lon1: number = first.getLongitude();
		var lat2: number = second.getLatitude();
		var lon2: number = second.getLongitude();
		
		var theta: number = lon1 - lon2;
		var dist: number = Math.sin(MapUtils.deg2rad(lat1)) * Math.sin(MapUtils.deg2rad(lat2)) + Math.cos(MapUtils.deg2rad(lat1))
		* Math.cos(MapUtils.deg2rad(lat2)) * Math.cos(MapUtils.deg2rad(theta));
		dist = Math.acos(dist);
		dist = MapUtils.rad2deg(dist);
		dist = dist * 60 * 1.1515 * 1609.344; // meters
		return dist;
	}
	
	public static deg2rad(deg: number): number {
		return (deg * Math.PI / 180.0);
	}
	
	public static rad2deg(rad: number): number {
		return (rad * 180 / Math.PI);
	}
}
export = MapUtils;