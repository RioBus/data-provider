import Bus 		   = require("../domain/entity/bus");
import IBusiness   = require("./iBusiness");
import IDataAccess = require("../dataAccess/iDataAccess");
import $inject 	   = require("../core/inject");

class ServerBusines implements IBusiness{
    
    public constructor(private dataAccess: IDataAccess = $inject("dataAccess/busDataAccess")){}
    
	create(data: Bus[]): void {
		this.dataAccess.create(data);
	}
	
	retrieve(itineraries: any): Bus[] {
        return this.dataAccess.retrieve(itineraries);
    }
    
	update(...args: any[]): any {}
    
	delete(...args: any[]): any {}
}
export = ServerBusines;