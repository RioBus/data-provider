import IBusiness = require("../business/iBusiness");
import IService  = require("./iService");
import $inject   = require("../core/inject");

class ServerService implements IService{
	
	public constructor(private business: IBusiness = $inject("business/serverBusiness")){}
	
	public create(...args: any[]): any {}
	
	public retrieve(...args: any[]): any {
		this.business.retrieve();
	}
	
	public update(...args: any[]): any {}
	
	public delete(...args: any[]): any {}
}
export = ServerService;