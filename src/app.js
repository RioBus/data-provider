'use strict';
/* global process; */
const Config        = require('./config');
const Core          = require('./core');
const LoggerFactory = Core.LoggerFactory;
const Router        = Core.Router;
const spawn         = require('co');

const logger = LoggerFactory.getRuntimeLogger();

spawn(function* main(){
    logger.info('Starting the server...');
})
.catch(function(error) {
    logger.error(error);
    process.exit(1);
});