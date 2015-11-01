/**
 * Describes a Itinerary instance
 * @class {Itinerary}
 */
class Itinerary {
	
	constructor(line, description, agency, keywords, spots) {
		this.line = line || 'desconhecido';
		this.description = description || 'desconhecido';
		this.agency = agency || '';
		this.keywords = keywords || '';
		this.spots = spots || [];
	}
}
module.exports = Itinerary;