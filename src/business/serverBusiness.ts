import IBusiness = require("./iBusiness");
import IDataAccess = require("../dataAccess/iDataAccess");
import DataAccessFactory = require("../dataAccess/dataAccessFactory");
import List = require("../common/tools/list");
import Bus = require("../domain/bus");

class ServerBusines implements IBusiness{
	
	private dataAccess: IDataAccess;
	
	public constructor(){
		this.dataAccess = DataAccessFactory.getBusDataAccess();
	}
	
	public handle(): void{
		var data: List<Bus> = this.dataAccess.handle();
		if(data.size()>0)
			this.dataAccess.handle(data);
	}
}
export = ServerBusines;