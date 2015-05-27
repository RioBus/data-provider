import IBusiness 		 = require("./iBusiness");
import ServerBusiness 	 = require("./serverBusiness");
import ItineraryBusiness = require("./itineraryBusiness");

class BusinessFactory{
	
	public static getServerBusiness(): IBusiness{
		return new ServerBusiness();
	}
	
	public static getItineraryBusiness(): IBusiness{
		return new ItineraryBusiness();
	}
}
export = BusinessFactory;