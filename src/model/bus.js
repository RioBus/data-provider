const Moment = require('moment-timezone');
/**
 * Describes a bus instance
 * @class {Bus}
 */
class Bus {
	
	constructor(line, order, speed, direction, latitude, longitude, timestamp, sense) {
		this.line = line.toString() || 'desconhecido';
		this.order = order.toString();
		this.speed = speed || 0;
		this.direction = direction || 0;
		this.latitude = latitude;
		this.longitude = longitude;
		this.timestamp = Moment.tz(timestamp, "America/Sao_Paulo").format();
		this.sense = sense || 'desconhecido';
    }
}
module.exports = Bus;