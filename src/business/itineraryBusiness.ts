import IBusiness   = require("./iBusiness");
import IDataAccess = require("../dataAccess/iDataAccess");
import List 	   = require("../common/tools/list");
import Itinerary   = require("../domain/entity/itinerary");
import $inject     = require("../core/inject");

/**
 * Itinerary Business logics
 *
 * @class ItineraryBusiness
 */
class ItineraryBusiness implements IBusiness{
    
    public constructor(private dataAccess: IDataAccess = $inject("dataAccess/itineraryDataAccess")){}
    
	create(...args: any[]): any {}
	
    /**
     * Returns the Itinerary, given a line
     * @param {String} line
     * @returns List<Itinerary>
     */
	retrieve(line: string): List<Itinerary> {
        return this.dataAccess.retrieve(line);
    }
    
	update(...args: any[]): any {}
    
	delete(...args: any[]): any {}
    
}
export = ItineraryBusiness;