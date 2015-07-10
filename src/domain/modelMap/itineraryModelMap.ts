import ICollection   = require("../../core/database/iCollection");
import IModelMap 	 = require("../../core/database/iModelMap");
import Itinerary 	 = require("../entity/itinerary");
import ItinerarySpot = require("../entity/itinerarySpot");

class ItineraryModelMap implements IModelMap {
	
	preConfig(collection: ICollection<Itinerary>): void {
		collection.createIndex({line: 1});
	}
	
	public getInstance<T>(data: any): Itinerary {
		var spots: ItinerarySpot[] = new Array<ItinerarySpot>();
		if(data.spots.length>0){
			data.spots.forEach( (spot)=>{
				spots.push(new ItinerarySpot(spot.latitude, spot.longitude, spot.returning));
			});
		}
		return new Itinerary(data.line, data.description, data.agency, spots, data._id);
	}
}
export = ItineraryModelMap;