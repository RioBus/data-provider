/// <reference path="../defs/tsd.d.ts" />
import Factory        = require("./common/factory");
import Logger         = require("./common/logger");
import Config   	  = require("./config");
import ServiceFactory = require("./service/serviceFactory");
import IService       = require("./service/iService");

/**
 * Main application process.
 * @class App
 */
class Application{

    /**
     * Init application
     *
     * @method main
     * @param {String[]} argv Process arg list
     * @return {void}
     */
    public static main(argv: String[]): void{
        "use strict";

        var logger: Logger = Factory.getServerLogger();
        logger.info('Starting the server...');
        
        var updateInterval = Config.environment.provider.updateInterval;
        
        var service: IService = ServiceFactory.getServerService();
        service.handle();
        Application.schedule(()=>{
            service.handle();
        }, updateInterval);
    }
    
    public static schedule(callback: ()=>void, updateInterval: number): void{
        setTimeout( ()=>{
            callback();
            Application.schedule(callback, updateInterval);
        }, updateInterval);
    }
}

export = Application;