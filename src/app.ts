import Bus            = require("./domain/entity/bus");
import Factory        = require("./common/factory");
import Logger         = require("./common/logger");
import Config   	  = require("./config");
import IDataAccess    = require("./dataAccess/iDataAccess");
import Itinerary      = require("./domain/entity/itinerary");
import Strings        = require("./strings");
import MailServer     = require("./core/mail/mailServer");
import MailObject     = require("./core/mail/mailObject");
import Utils          = require("./common/tools/utils");
import $inject        = require("./core/inject");

var DeAsync = require("deasync");

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
     * @param {String[]} argv Process arg list
     * @return {void}
     */
    public static main(argv: string[]): void {
        Application.handleFatalError();
        var ida: IDataAccess = $inject("dataAccess/itineraryDataAccess");
        var bda: IDataAccess = $inject("dataAccess/busDataAccess");
        
        Application.logger = Factory.getServerLogger();
        Application.logger.info(Strings.provider.rest.start);
        
        var updateInterval: number = Config.environment.provider.updateInterval;
        var itineraries: any = Application.mapItineraries(ida.retrieve());
        var output: any;
        var buses: Bus[];
        
        while(true) {
            Application.logger.info("Getting buses...");
            output = bda.retrieve(itineraries);
            buses = output.buses;
            itineraries = output.itineraries;
            if(buses!==null && buses!==undefined && buses.length>0) bda.create(buses);
            Application.logger.info(buses.length+" documents processed successfully.");
            DeAsync.sleep(updateInterval);
        }
    }
    
    public static mapItineraries(data: Itinerary[]): any {
        var obj: any = {};
        data.forEach((itinerary)=>{
            obj[itinerary.getLine()] = itinerary;
        });
        return obj;
    }
    
    public static handleFatalError(): void {
        process.on('uncaughtException', (error: any) => {
            Application.logger.info(error.stack);
            
            var msgConfig: any = Config.errorMailMessage;
            var mail: MailObject = new MailObject();
            mail.setFromAddress(msgConfig.from);
            mail.setToAddress(msgConfig.to);
            mail.setSubject(msgConfig.subject);
            mail.setMessage(Utils.replacePattern(/\$\$/, error.stack, msgConfig.text));
            
            var mailServer: MailServer = new MailServer();
            mailServer.sendMail(mail, (error, message) =>{
                //if(error) console.log(error);
                //if(message) console.log(message);
                process.exit(-1);
            });
        });
    }
}

export = Application;