import ICollection = require("../../iCollection");
import IModelMap   = require("../../iModelMap");
import Sync   	   = require("../../../sync");

class MongoCollection<T> implements ICollection<T>{
	
	public constructor(private context: any, private map: IModelMap) {
		map.preConfig(this);
	}
	
	count(query: any={}): number {
		if(query===undefined) query = {};
		return Sync.promise(this.context, this.context.count, query);
	}
	
	createIndex(fieldOrSpec: any, options: any = {}): void {
		return Sync.promise(this.context, this.context.ensureIndex, fieldOrSpec, options);
	}
	
	public find(params: any = {}): Array<T> {
		var find: any = Sync.promise(this.context, this.context.find, params);
		var data: Array<any> = Sync.promise(find, find.toArray);
		var list = new Array<T>();
		data.forEach((obj) => {
			list.push(this.map.getInstance<T>(obj));
		});
		return list;
	}
	
	public findById(id: number): T {
		var find: any = Sync.promise(this.context, this.context.find, {id: id});
		var data: any[] = Sync.promise(find, find.toArray);
		if(data.length>0) return this.map.getInstance<T>(data[0]);
		else throw new Error("Document not found");
	}
	
	public findOrCreate(data: any): T {
		var update: any = { $setOnInsert: data }; 
		var options = {
			new: true,
			upsert: true
		};
		var findAndModify: any = Sync.promise(this.context, this.context.findAndModify, data, [], update, options);
		if(findAndModify instanceof Error) throw findAndModify;
		return this.map.getInstance<T>(findAndModify);
	}
	
	public save(obj: T): T {
		var saveOperation: any = Sync.promise(this.context, this.context.insert, obj);
		return this.map.getInstance<T>(saveOperation.ops[0]);
		// Workaround. depois e necessario corrigir!!!
	}
	
	public update(params: any, data: any): any {
		var data: any = Sync.promise(this.context, this.context.update, params, { $set: data });
		return this.map.getInstance(data);
	}
	
	public remove(params: any): boolean {
		return Sync.promise(this.context, this.context.remove, params);
	}
}
export = MongoCollection;