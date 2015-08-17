import IBulk 	 	 = require("../../iBulk");
import IBulkFind 	 = require("../../iBulkFind");
import IModelMap 	 = require("../../iModelMap");
import MongoBulkFind = require("./mongoBulkFind");
/**
 * Implements MongoDB Bulk operation
 * @class MongoBulk
 */
class MongoBulk<T> implements IBulk<T> {
	
	public constructor(private context: any, private map: IModelMap) {}
	
	public execute(callback?: (error: Error, output: any)=>void): void {
		this.context.execute((error, response)=>{
			if(callback!==undefined) callback(error, response);
		});
	}
	
	public find(query: any): IBulkFind<T> {
		var data: any = this.map.prepareToInput(query);
		var find: any = this.context.find(data);
		return new MongoBulkFind<T>(find, this.map);
	}
	
	public insert(obj: T): void {
		var data: any = this.map.prepareToInput(obj);
		this.context.insert(data);
	}
}
export = MongoBulk;