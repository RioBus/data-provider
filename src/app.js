import {Factory} from './common/factory';
import {ServiceFactory} from './service/factory';

let strings = Factory.getStrings();
/**
 * DataProvider application bootstrapper
 *
 * Bootstraps the Data Provider service, which searchs and stores
 * the bus information given in by the DataRio webservice.
 * @class App
 */
export class App{

    /**
     * Init providers
     *
     * @method main
     * @param {Array} argv Process arg list
     * @return {void}
     */
	static main(argv){
        let intervalTime = Factory.getConfig().server.dataProvider.intervalTime;
        let logger = Factory.getDataProviderLogger();
        logger.info(strings.provider.data.start);

        let service = ServiceFactory.getServerService();
        service.storeAllData();
        App.schedule(function(){ service.storeAllData(); }, intervalTime);
	}

    static schedule(callback, intervalTime){
        setTimeout(function(){
            callback();
            App.schedule(callback, intervalTime);
        }, intervalTime);
    }
}