import IService = require("./iService");
import ServerService = require("./serverService");

class ServiceFactory{
	
	public static getServerService(): IService{
		return new ServerService();
	}
}
export = ServiceFactory;