/// <reference path="../defs/tsd.d.ts" />
declare var global;
global.Config = require("./config");
global.Strings = require("./strings");

try{
	require("./app").main(process.argv);
} catch(e){
	console.log(e.stack);
	process.exit(1);
}