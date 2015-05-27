import IService 		= require("./iService");
import ServerService 	= require("./serverService");
import ItineraryService = require("./itineraryService");

class ServiceFactory{
	
	public static getServerService(): IService{
		return new ServerService();
	}
	
	public static getItineraryService(): IService{
		return new ItineraryService();
	}
}
export = ServiceFactory;