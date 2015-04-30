import {ServerDataAccess} from './server';
/**
 * DataAccessFactory provides decoupling to the DataAccess layer.
 * You may use it to avoid direct dependency to the Data Access layer classes.
 * The DataAccess layer is responsible for all the operations over the stored data.
 */
export class DataAccessFactory{

    /**
     * Gets the ServerDataAccess instance
     * @returns {ServerDataAccess}
     */
    static getServerDataAccess(){
        "use strict";
        return new ServerDataAccess();
    }
}