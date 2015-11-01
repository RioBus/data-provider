'use strict';
/* global database; */

class ItineraryDAO {
	
	constructor(connection) {
		if(!connection) connection = database;
		this.collection = connection.collection('itinerary');
	}
	
	getAll() {
		return this.collection.find({});
	}
	
	save(itinerary) {
		return this.collection.insert(itinerary);
	}
}
module.exports = ItineraryDAO;