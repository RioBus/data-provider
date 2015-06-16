/// <reference path="../../defs/node/node.d.ts" />
var DeAsync = require("deasync");

class Sync {
	
	public static run(operation: Function, ...params: any[]): any {
		return DeAsync(operation).apply(operation, params);
	}
}
export = Sync;