import ICollection = require("../../core/database/iCollection");
import IModelMap   = require("../../core/database/iModelMap");
import Bus		   = require("../entity/bus");

class BusModelMap implements IModelMap {
	
	preConfig(collection: ICollection<Bus>): void {
		collection.createIndex({line: 1, bus: 1});
	}
	
	public getInstance<T>(data: any): Bus {
		return new Bus(data.line, data.order, data.speed, data.direction, data.latitude, data.longitude, data.timestamp, data.sense);
	}
}
export = BusModelMap;