/// <reference path="../defs/node/node.d.ts" />
try{
	require("./app").main(process.argv);
} catch(e){
	console.log(e);
}