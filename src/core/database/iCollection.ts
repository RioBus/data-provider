import IModelMap = require("./iModelMap");

interface ICollection<T> {
	find(params?: any): Array<T>;
	findById(id: any): T;
	save(obj: T): any;
	update(obj: T): any;
	remove(params: any): any;
}
export = ICollection;