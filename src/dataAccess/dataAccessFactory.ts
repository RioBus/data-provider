import IDataAccess = require("./iDataAccess");
import BusDataAccess = require("./busDataAccess");

class DataAccessFactory{
	
	public static getBusDataAccess(): IDataAccess{
		return new BusDataAccess();
	}
}
export = DataAccessFactory;