import IBusiness = require("../business/iBusiness");
import IService  = require("./iService");
import Itinerary = require("../domain/itinerary");
import List      = require("../common/tools/list");
import $inject   = require("../core/inject");

/**
 * Provides an interface to the Itinerary business logic
 * @class ItineraryService
 */
class ItineraryService implements IService{
	
	public constructor(private business: IBusiness = $inject("business/itineraryBusiness")) {}
	
	public create(...args: any[]): any {}
	
	public retrieve(line: string): List<Itinerary> {
		return this.business.retrieve(line);
	}
	
	public update(...args: any[]): any {}
	
	public delete(...args: any[]): any {}
    
}
export = ItineraryService;