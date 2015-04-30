import {Logger} from './logger';

/**
 * Factory Helper
 *
 * Factories main objects to help decoupling the code
 */
export class Factory{

    /**
     * Gets the configuration data object
     * @returns {exports|*}
     */
    static getConfig(){
        "use strict";
        if(!Factory.configuration){
            Factory.configuration = require('../config');
        }
        return Factory.configuration;
    }

    /**
     * Gets a new Logger instance
     * @param filePath Log file path
     * @param flag Log flag (default: RUNTIME)
     * @returns {Logger}
     */
    static getLogger(filePath=null, flag=''){
        "use strict";
        if(!filePath) filePath = Factory.getConfig().runtimeLog;
        return new Logger(filePath, flag);
    }

    /**
     * Gets a new Logger instance to log DataProvider messages
     * @returns {Logger}
     */
    static getDataProviderLogger(){
        "use strict";
        let providerLogPath = Factory.getConfig().server.dataProvider.log;
        return Factory.getLogger(providerLogPath, 'DATA PROVIDER');
    }

    /**
     * Gets the strings data object
     * @returns {exports|*}
     */
    static getStrings(){
        "use strict";
        if(!Factory.strings){
            Factory.strings = require('../strings');
        }
        return Factory.strings;
    }
}