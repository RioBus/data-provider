'use strict';
/* global database; */
/**
 * Bus Data Access Object
 * @class {BusDAO}
 */
class BusDAO {
	
	constructor(connection) {
		if(!connection) connection = database;
		this.bus = connection.collection('bus');
		this.history = connection.collection('bus_history');
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