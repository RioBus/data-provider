import IBusiness = require("./iBusiness");
import ServerBusiness = require("./serverBusiness");

class BusinessFactory{
	
	public static getServerBusiness(): IBusiness{
		return new ServerBusiness();
	}
}
export = BusinessFactory;