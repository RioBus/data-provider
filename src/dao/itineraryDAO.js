'use strict';
/* global database; */
/**
 * Itinerary Data Access Object
 * @class {BusDAO}
 */
class ItineraryDAO {
	
	constructor(connection) {
		if(!connection) connection = database;
		this.collection = connection.collection('itinerary');
	}
	
	/**
	 * Retrieves all itinerary data contained in the data repository
	 * @return {Promise}
	 */
	getAll() {
		return this.collection.find({});
	}
	
	/**
	 * Saves a new itinerary
	 * @param {Itinerary} itinerary - Itinerary data to be inserted
	 * @return {Promise}
	 */
	save(itinerary) {
		return this.collection.insert(itinerary);
	}
}
module.exports = ItineraryDAO;