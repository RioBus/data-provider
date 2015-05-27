import IBusiness 		 = require("./iBusiness");
import DataAccessFactory = require("../dataAccess/dataAccessFactory");
import List 			 = require("../common/tools/list");
import Itinerary 		 = require("../domain/itinerary");

/**
 * Itinerary Business logics
 *
 * @class ItineraryBusiness
 */
class ItineraryBusiness implements IBusiness{
	
    /**
     * Handles the request
     * @param {String} line
     * @returns List<Itinerary>
     */
	public handle(line: string): List<Itinerary>{
		return this.getItinerary(line);
	}
	
    /**
     * Returns the Itinerary, given a line
     * @param {String} line
     * @returns List<Itinerary>
     */
    getItinerary(line: string): List<Itinerary>{
        var dataAccess = DataAccessFactory.getItineraryDataAccess();
        return dataAccess.handle(line);
    }
}
export = ItineraryBusiness;