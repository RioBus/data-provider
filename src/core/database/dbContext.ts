/// <reference path="../../../defs/node/node.d.ts" />
import Config 		= require("../../config");
import ICollection  = require("./iCollection");
import IDatabase 	= require("./iDatabase");
import List 		= require("../../common/tools/list");
import $inject 		= require("../inject");

var config: any = (Config.isProduction())?
	Config.environment.production.database : Config.environment.development.database;

class DbContext{
	
	private context: IDatabase;
	
	public constructor(dbConfig?: any){
		this.context = this.getContext(dbConfig);
	}
	
	public collection<T>(name: string): ICollection<T>{
		return this.context.collection(name);
	}
	
	private getContext(dbConfig: any): IDatabase {
		var connector = dbConfig.driver.toLowerCase();
		var driverPath = "core/database/driver";
		switch(connector) {
			case "mongodb":
			case "mongo":
				connector = driverPath+"/mongodb/MongoDb";
				break;
			default: break;
		}
		return $inject(connector, dbConfig.config);
	}
}
export = DbContext;