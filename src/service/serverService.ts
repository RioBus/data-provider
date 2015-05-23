import IService = require("./iService");
import BusinessFactory = require("../business/businessFactory");

class ServerService implements IService{
	
	public handle(): void{
		BusinessFactory.getServerBusiness().handle();
	}
}
export = ServerService;