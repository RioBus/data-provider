/* global Buffer; */
'use strict';
const File   = require('./file');
const Config = require('../config');

/**
 * Manipulates cache files
 * @class {Cache}
 */
class Cache {
	
	constructor(key) {
		var dir = Config.cache;
		if(dir[dir.length-1]!=='/') dir += '/';
		this.file = new File(dir+key);
	}
	
	/**
	 * Reads data from cache
	 * @return {string}
	 */
	retrieve() {
		return new Buffer(this.file.read(), 'base64').toString('utf8');
	}
	
	/**
	 * Writes data to cache
	 * @param {string} content - Content to write
	 * @return {void}
	 */
	write(content) {
		this.file.write(new Buffer(content).toString('base64'));
	}
}
module.exports = Cache;