'use strict';
const GeolocatedSpot = require('./geolocatedSpot');
const Moment = require('moment-timezone');
/**
 * Describes a bus instance
 * @class {Bus}
 */
class Bus extends GeolocatedSpot {
	
	constructor(line, order, speed, direction, latitude, longitude, timestamp, sense) {
		super(latitude, longitude);
		this.line = line.toString() || 'desconhecido';
		this.order = order.toString();
		this.speed = speed || 0;
		this.direction = direction || 0;
		timestamp = (new Date(timestamp)).toISOString();
		this.timestamp = Moment.tz(timestamp, "America/Sao_Paulo").format();
		this.sense = sense || 'desconhecido';
    }
}
module.exports = Bus;