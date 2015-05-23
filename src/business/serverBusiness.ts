import IBusiness = require("./iBusiness");
import IDataAccess = require("../dataAccess/iDataAccess");
import DataAccessFactory = require("../dataAccess/dataAccessFactory");

class ServerBusines implements IBusiness{
	
	private dataAccess: IDataAccess;
	
	public constructor(){
		this.dataAccess = DataAccessFactory.getBusDataAccess();
	}
	
	public handle(): void{
		var data: any = this.dataAccess.handle();
		if(!data.type){
			this.dataAccess.handle(data);
		}
	}
}
export = ServerBusines;