import ICollection = require("../../iCollection");
import IModelMap   = require("../../iModelMap");
import Sync   	   = require("../../../sync");

class MongoCollection<T> implements ICollection<T>{
	
	public constructor(private context: any, private map: IModelMap<T>) {}
	
	public find(params?: any): Array<T>{
		if(params===undefined) params = {};
		var find: any = this.context.find;
		var data: any = Sync.promise(find, find.toArray, params);
		var list = new Array<T>();
		data.forEach((obj) => {
			list.push(this.map.getInstance(obj));
		});
		return list;
	}
	
	public findById(id: number): T{
		var find: any = this.context.find;
		var data: any = Sync.promise(find, find.toArray, {id: id});
		return this.map.getInstance(data[0]);
	}
	
	public save(obj: T): T {
		var data: any = Sync.promise(this.context, this.context.insert, obj);
		return this.map.getInstance(data);
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