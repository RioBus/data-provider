import Factory        = require("./common/factory");
import Logger         = require("./common/logger");
import Config   	  = require("./config");
import ServiceFactory = require("./service/serviceFactory");
import IService       = require("./service/iService");
import Strings        = require("./strings");
import MailServer     = require("./core/mail/mailServer");
import MailObject     = require("./core/mail/mailObject");

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
    public static main(argv: string[]): void{
        "use strict";

        var logger: Logger = Factory.getServerLogger();
        logger.info(Strings.provider.rest.start);
        
        var updateInterval = Config.environment.provider.updateInterval;
        
        var service: IService = ServiceFactory.getServerService();
        service.handle();
        Application.schedule( ()=>{
            service.handle();
        }, updateInterval);
        
        Application.handleFatalError();
        
        var fs = require('fs');

fs.readFile('somefile.txt', function (err, data) {
  if (err) throw err;
  console.log(data);
});
    }
    
    public static schedule(callback: ()=>void, updateInterval: number): void{
        setTimeout( ()=>{
            callback();
            Application.schedule(callback, updateInterval);
        }, updateInterval);
    }
    
    public static handleFatalError(): void{
        process.on('uncaughtException', (error: any) => {
            
            var msgConfig: any = Config.errorMailMessage;
            var mail: MailObject = new MailObject();
            mail.setFromAddress(msgConfig.from);
            mail.setToAddress(msgConfig.to);
            mail.setSubject(msgConfig.subject);
            mail.setMessage(msgConfig.text + error);
            
            var mailServer: MailServer = new MailServer();
            mailServer.sendMail(mail, (error, message) =>{
                if(error) console.log(error);
                if(message) console.log(message);
                process.exit(-1);
            });
            
        });
    }
}

export = Application;