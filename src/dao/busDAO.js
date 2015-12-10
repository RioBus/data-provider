'use strict';
/* global database; */

function getSchema() {
	return {
		line: { type: String },
		order: { type: String },
		speed: { type: Number },
		direction: { type: Number },
		timestamp: { type: Date },
		sense: { type: String }
	};
}

/**
 * Bus Data Access Object
 * @class {BusDAO}
 */
class BusDAO {
	
	constructor(connection) {
		if(!connection) connection = database;
		this.bus = connection.collection('bus', { schema: getSchema() });
		this.history = connection.collection('bus_history', { schema: getSchema() });
	}
	
	/**
	 * Retrieves all bus data contained in the data repository
	 * @return {Promise}
	 */
	getAll() {
		return this.bus.find({});
	}
	
	/**
	 * Saves a batch to the search collection
	 * @param {Bus[]} buses - Bus batch to be inserted
	 * @return {Promise}
	 */
	commonSave(buses) {
		return this.bus.insert(buses);
	}
	
	/**
	 * Saves a batch to the history collection
	 * @param {Bus[]} buses - Bus batch to be inserted
	 * @return {Promise}
	 */
	historySave(buses) {
		return this.history.insert(buses);
	}
}
module.exports = BusDAO;