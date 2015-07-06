/// <reference path="../../../../defs/node/node.d.ts" />
import ICollection = require("../../iCollection");
import IDatabase   = require("../../iDatabase");
import List 	   = require("../../../../common/tools/list");

class MongoDb implements IDatabase {
	
	private context: any;
	
	public constructor(){
		this.context = require("mongoose");
	}
	
	public collection<T>(name: string): ICollection<T> {
		return null;
	}
}
export = MongoDb;