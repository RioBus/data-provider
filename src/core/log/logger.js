'use strict';
const colors = require('colors');
const Config = require('../../config');
const File = require('../file');

/**
 * Logger class
 * 
 * Improved logging interface
 * @class {Logger}
 */
class Logger {
	
	constructor(path) {
		if(!path) path = Config.logs.runtime;
		this.fs = new File(path);
	}
	
	/**
	 * Displays an alert level log
	 * @param {string} content - Log message
	 * @return {void}
	 */
	alert(content) {
		this.log(content, 'ALERT', colors.yellow);
	}
	
	/**
	 * Displays an error level log
	 * @param {string} content - Log message
	 * @return {void}
	 */
	error(content) {
		this.log(content, 'ERROR', colors.red);
	}
	
	/**
	 * Displays an fatal error level log
	 * @param {string} content - Log message
	 * @return {void}
	 */
	fatal(content) {
		this.log(content, 'FATAL', colors.red);
	}
	
	/**
	 * Displays an information level log
	 * @param {string} content - Log message
	 * @return {void}
	 */
	info(content) {
		this.log(content);
	}
	
	/**
	 * Displays an custom level log
	 * @param {string} content - Log message
	 * @param {string} level - Log level (Optional)
	 * @param {color} color - Color of the log message (Optional)
	 * @return {void}
	 */
	log(content, level, color) {
		if(!level) level = 'INFO';
		var text = `[${new Date().toISOString()}] (${level}) ${content}`;
		if (color) console.log(color(text));
        else console.log(text);
		this.fs.append(text);
	}
}
module.exports = Logger;