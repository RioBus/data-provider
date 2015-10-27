import Bus            = require("./domain/entity/bus");
import DbContext      = require("./core/database/dbContext");
import Factory        = require("./common/factory");
import Logger         = require("./common/logger");
import IDataAccess    = require("./dataAccess/iDataAccess");
import Itinerary      = require("./domain/entity/itinerary");
import MailServer     = require("./core/mail/mailServer");
import MailObject     = require("./core/mail/mailObject");
import Utils          = require("./common/tools/utils");
import $inject        = require("./core/inject");

var sleep = require("deasync").sleep;
declare var Config, Strings, global, require, process;

/**
 * Main application process.
 * @class App
 */
class Application{
    
    public static logger: Logger;

    /**
     * Init application
     *
     * @method main
     * @param {string[]} argv Process arg list
     * @return {void}
     */
    public static main(argv: string[]): void {
        Application.handleFatalError();
        global.database = new DbContext();
        
        var ida: IDataAccess = $inject("dataAccess/itineraryDataAccess");
        var bda: IDataAccess = $inject("dataAccess/busDataAccess");
        
        Application.logger = Factory.getLogger();
        Application.logger.info(Strings.provider.data.start);
        
        var updateInterval: number = Config.environment.provider.updateInterval;
        var itineraries: any = Application.mapItineraries(ida.retrieve());
        var output: any = { buses: [], itineraries: itineraries };
        
        while(true) {
            Application.logger.info(Strings.dataaccess.bus.downloading);
            output = bda.retrieve(output);
            if(output.buses.length>0) bda.create(output.buses);
            Application.logger.info(output.buses.length+Strings.dataaccess.bus.processed);
            output.buses = [];
            sleep(updateInterval);
        }
    }

    /**
     * Map the Itinerary[] to a dictionary-like so the routine can access it easily. 
     * @method mapItineraries
     * @param {Itinerary[]} itineraries
     * @return {Object}
     */
    public static mapItineraries(itineraries: Itinerary[]): Object {
        var obj: Object = {};
        itineraries.forEach((itinerary)=>{ obj[itinerary.getLine()] = itinerary; });
        return obj;
    }

    /**
     * Handles 'uncaughtException' and exits process.
     * @method handleFatalError
     * @return {void}
     */
    public static handleFatalError(): void {
        process.on('uncaughtException', (error: any) => {
            Application.logger.error(error.stack);
            
            process.exit(-1);
        });
    }
}

export = Application;