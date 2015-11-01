'use strict';
/* global database; */

class BusDAO {
	
	constructor(connection) {
		if(!connection) connection = database;
		this.bus = connection.collection('bus');
		this.history = connection.collection('bus_history');
	}
	
	commonSave(bus) {
		return this.bus.insert(bus);
	}
	
	historySave(bus) {
		return this.history.insert(bus);
	}
}
module.exports = BusDAO;