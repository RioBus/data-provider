import {ServerBusiness} from './server';

/**
 * BusinessFactory provides decoupling to the business logic layer.
 * You may use it to avoid direct dependency to the Business layer classes.
 * The Business layer is responsible for the application's business logic.
 *
 * @class BusinessFactory
 */
export class BusinessFactory{

    /**
     * Returns a ServerBusiness instance
     * @returns {ServerBusiness}
     */
    static getServerBusiness(){
        "use strict";
        return new ServerBusiness();
    }

}