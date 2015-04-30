import {ServerService} from './server';
/**
 * ServiceFactory provides decoupling to the service layer.
 * You may use it to avoid direct dependency to the Service layer classes.
 * The Service layer provides an interface between the application and the
 * business logic.
 *
 * @class ServiceFactory
 */
export class ServiceFactory{

    /**
     * Gets a ServerService instance
     * @returns {ServerService}
     */
    static getServerService(){
        "use strict";
        return new ServerService();
    }
}