import IService = require("./iService");
import BusinessFactory = require("../business/businessFactory");
import List = require("../common/tools/list");
import Itinerary = require("../domain/itinerary");

/**
 * Provides an interface to the Itinerary business logic
 * @class ItineraryService
 */
class ItineraryService implements IService{

    /**
     * Handles the request
     * @param {string} line
     * @return List<Itinerary>
     */
	public handle(line: string): List<Itinerary>{
        return this.getItinerary(line);
    }
    
    /**
     * Access business logic to search for the given itinerary
     * @param {string} request
     * @return List<Itinerary>
     */
    getItinerary(line: string): List<Itinerary>{
        var business = BusinessFactory.getItineraryBusiness();
        return business.handle(line);
    }
}
export = ItineraryService;