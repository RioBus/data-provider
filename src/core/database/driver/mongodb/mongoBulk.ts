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
	
	/**
	 * Does the bulk operation
	 * @param {Function} callback - Procedure to execute after Bulk Op execution
	 * @return {void}
	 */
	public execute(callback?: (error: Error, output: any)=>void): void {
		this.context.execute((error, response)=>{
			if(callback!==undefined) callback(error, response);
		});
	}
	
	/**
	 * Queries the collection for the document(s)
	 * @param {any} query - query data to find the document
	 * @return {IBulkFind}
	 */
	public find(query: any): IBulkFind<T> {
		var data: any = this.map.prepareToInput(query);
		var find: any = this.context.find(data);
		return new MongoBulkFind<T>(find, this.map);
	}
	
	/**
	 * Registers an insert operation within the Bulk
	 * @param {T} obj - Document data
	 * @return {void}
	 */
	public insert(obj: T): void {
		var data: any = this.map.prepareToInput(obj);
		this.context.insert(data);
	}
}
export = MongoBulk;