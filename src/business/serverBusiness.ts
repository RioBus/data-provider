import Bus 		   = require("../domain/bus");
import IBusiness   = require("./iBusiness");
import IDataAccess = require("../dataAccess/iDataAccess");
import List 	   = require("../common/tools/list");
import $inject 	   = require("../core/inject");

class ServerBusines implements IBusiness{
    
    public constructor(private dataAccess: IDataAccess = $inject("dataAccess/busDataAccess")){}
    
	create(data: List<Bus>): void {
		this.dataAccess.create(data);
	}
	
	retrieve(): void {
        var data: List<Bus> = this.dataAccess.retrieve();
		if(data.size()>0) this.create(data);
    }
    
	update(...args: any[]): any {}
    
	delete(...args: any[]): any {}
}
export = ServerBusines;