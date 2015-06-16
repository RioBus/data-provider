/// <reference path="../../../defs/node/node.d.ts" />
import Config = require("../../config");
var Driver = require("arangojs");

class Database{
	
	private context: any;
	
	public constructor(dbConfig?: any){
		if(dbConfig===undefined){
			dbConfig = (Config.isProduction())?
				Config.environment.production.database : Config.environment.development.database;
		}
		var db = new Driver(dbConfig);
		try{
			this.context = db.database.sync(db, dbConfig.databaseName);
		} catch(e){
			this.context = db.createDatabase.sync(db, dbConfig.databaseName);
		}
	}
	
	public collection(name: string): any{
		try{
			return this.context.collection.sync(this.context, name);
		} catch(e){
			return this.context.createCollection.sync(this.context, name);
		}
	}
	
	public edgeCollection(name: string): any{
		try{
			return this.context.edgeCollection.sync(this.context, name);
		} catch(e){
			return this.context.createEdgeCollection.sync(this.context, name);
		}
	}
	
	public query(queryString: string): any{
		return this.context.query.sync(this.context, queryString);
	}
}
export = Database;