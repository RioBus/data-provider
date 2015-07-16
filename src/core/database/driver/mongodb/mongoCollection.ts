import ICollection = require("../../iCollection");
import IModelMap   = require("../../iModelMap");
import Sync   	   = require("../../../sync");

class MongoCollection<T> implements ICollection<T>{
	
	public constructor(private context: any, private map?: IModelMap) {
		map.preConfig(this);
	}
	
	private getData(data: any): any {
		return (this.map!==undefined)? this.map.getInstance<T>(data) : data;
	}
	
	public aggregate(commands: any[], options: any = {}): T[] | void {
		if(options.out===undefined){
			var output: any[] = Sync.promise(this.context, this.context.aggregate, commands, options);
			var result: T[] = Array<T>();
			if(output.length>0) output.forEach( (data)=>{ result.push(this.getData(data)); }, this);
			return result;
		}
		else this.context.aggregate(commands, options, (error, out)=>{ if(error) throw error; });
	}
	
	public count(query: any={}): number {
		query = this.map.prepareToInput(query);
		return Sync.promise(this.context, this.context.count, query);
	}
	
	public createIndex(fieldOrSpec: any, options: any = {}): void {
		this.context.ensureIndex(fieldOrSpec, options, (error, response)=>{ if(error) throw error; });
	}
	
	public find(query: any = {}): T[] {
		query = this.map.prepareToInput(query);
		var find: any = Sync.promise(this.context, this.context.find, query);
		var data: Array<any> = Sync.promise(find, find.toArray);
		var list: T[] = new Array<T>();
		data.forEach((obj) => { list.push(this.getData(obj)); }, this);
		return list;
	}
	
	public findById(id: number): T {
		return this.findOne({id: id});
	}
	
	public findAndModify(query: any, sort: any, update: any, options?: any): T {
		query = this.map.prepareToInput(query);
		var findAndModify: any = Sync.promise(this.context, this.context.findAndModify, query, sort, update, options);
		return (findAndModify.value!==null)? this.getData(findAndModify.value) : null;
	}
	
	public findOne(query: any, options: any={}): T {
		query = this.map.prepareToInput(query);
		var result: any = Sync.promise(this.context, this.context.findOne, query, options);
		return (result!==null)? this.getData(result) : null;
	}
	
	public findOrCreate(data: any): T {
		var update: any = { $set: this.map.prepareToInput(data) };
		var options = { "new": true, "upsert": true };
		return this.findAndModify(data, [], update, options);
	}
	
	public save(obj: T): T {
		var data: any = this.map.prepareToInput(obj);
		var saveOperation: any = Sync.promise(this.context, this.context.insert, data);
		return (saveOperation.ops.length>0)? this.getData(saveOperation.ops[0]) : null;
		// Workaround. depois e necessario corrigir!!!
	}
	
	public update(query: any, data: any, options: any={}): void {
		query = this.map.prepareToInput(query);
		data = this.map.prepareToInput(data);
		this.context.update(query, data, options, (error, output)=>{ if(error) throw error });
	}
	
	public remove(query: any = {}): void {
		query = this.map.prepareToInput(query);
		this.context.remove(query, (error, output)=>{ if(error) throw error; });
		//return Sync.promise(this.context, this.context.remove, query);
	}
}
export = MongoCollection;