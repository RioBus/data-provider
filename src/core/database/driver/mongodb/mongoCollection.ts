import ICollection = require("../../iCollection");
import IModelMap   = require("../../iModelMap");

class MongoCollection<T> implements ICollection<T>{
	
	public constructor(private map: IModelMap, private context: any) {}
	
	public find(params?: any): Array<T>{
		return null;
	}
	
	public findById(id: number): T{
		return null;
	}
	
	public save(obj: T): void {
		this.context.save(obj);
	}
	
	public update(obj: T): void {
		
	}
	
	public remove(params: any): void {
		
	}
}
export = MongoCollection;