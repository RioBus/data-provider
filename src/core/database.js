'use strict';
const Robe = require('robe');
const Config = require('../config');

/**
 * Does database operations
 * @class {Database}
 */
class Database {
	
	/**
	 * Connects to database
	 * @param {Object} config - Database configuration
	 * @return {Object}
	 */
	static connect(config) {
		if(!config) config = Config.database;
		var url = `${config.host}:${config.port}/${config.dbName}`;
		if(config.user!=='' && config.pass!=='') url = `${config.user}:${config.pass}@${url}`;
		return Robe.connect(url);
	}
}
module.exports = Database;