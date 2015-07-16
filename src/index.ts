/// <reference path="../defs/tsd.d.ts" />
try{
	require("./app").main(process.argv);
} catch(e){
	console.log(e.stack);
	process.exit(1);
}