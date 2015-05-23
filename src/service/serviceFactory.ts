import IService = require("./iService");
import ServerService = require("./serverService");

class ServiceFactory{
	
	public getServerService(): IService{
		return new ServerService();
	}
}
export = ServiceFactory;