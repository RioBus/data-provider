/* global Buffer; */
'use strict';
const File   = require("./file");
const Config = require("../config");

class Cache {
	
	constructor(key) {
		var dir = Config.cachePath;
		if(dir[dir.length-1]!=="/") dir += "/";
		this.file = new File(dir+key);
	}
	
	retrieve() {
		return new Buffer(this.file.read(), "base64").toString("utf8");
	}
	
	write(content) {
		this.file.write(new Buffer(content).toString("base64"))
	}
}
module.exports = Cache;