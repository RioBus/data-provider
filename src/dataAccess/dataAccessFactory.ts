import IDataAccess = require("./iDataAccess");
import BusDataAccess = require("./busDataAccess");
import ItineraryDataAccess = require("./itineraryDataAccess");

class DataAccessFactory{
	
	public static getBusDataAccess(): IDataAccess{
		return new BusDataAccess();
	}
	
	public static getItineraryDataAccess(): IDataAccess{
		return new ItineraryDataAccess();
	}
}
export = DataAccessFactory;