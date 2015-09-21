declare var require;
import ICollection = require("../../core/database/iCollection");
import BusModelMap = require("./busModelMap");
import Bus		   = require("../entity/bus");
var Moment		   = require("moment-timezone");

class HistoryModelMap extends BusModelMap {
	
	public collectionName: string = "bus_history";
	
	public preConfig(collection: ICollection<Bus>): void {
		//collection.createIndex({line: 1});
		//collection.createIndex({order: 1});
		collection.createIndex({timestamp: 1});
	}
}
export = HistoryModelMap;