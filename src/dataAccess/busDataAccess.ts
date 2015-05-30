import IDataAccess = require("./iDataAccess");
import Factory = require("../common/factory");
import Logger = require("../common/logger");
import Config = require("../config");
import HttpRequest = require("../core/httpRequest");
import File = require("../core/file");
import Bus = require("../domain/bus");
import BusList = require("../domain/busList");
import Strings = require("../strings");
import List = require("../common/tools/list");
import DbContext = require("../core/database/dbContext");

/**
 * DataAccess responsible for managing data access to the data stored in the
 * external server.
 *
 * @class ServerDataAccess
 * @constructor
 */
class BusDataAccess implements IDataAccess {

    private logger: Logger;
    private db: DbContext;
    private collectionName: string = "bus";

    public constructor() {
        this.logger = Factory.getServerLogger();
        this.db = new DbContext;
    }

    public handle(data?: any): List<Bus> | void {
        if (!data) return this.getBusData();
        this.storeBusData(data);
    }

    /**
     * Retrieves all data from the external storage
     * @returns {BusList}
     */
    private getBusData(): any {
        var busList: List<Bus> = new List<Bus>();
        
        var body: any = this.requestFromServer();
        if (body.type || !body.DATA) {
            this.logger.error(Strings.dataaccess.server.jsonError);
            return busList;
        }
        var data = body.DATA;
        //let columns = body.COLUMNS;
        // columns: ['DATAHORA', 'ORDEM', 'LINHA', 'LATITUDE', 'LONGITUDE', 'VELOCIDADE', 'DIRECAO']
        
        
        data.forEach( (d) => {
            // Converting external data do the application's pattern
            var bus = new Bus(d[2], d[1], d[5], d[6], d[3], d[4], d[0]);
            if (bus.getLine() === "") bus.setLine(Strings.dataaccess.bus.blankLine);
            busList.add(bus);
        });

        return busList;
    }

    /**
     * Stores the given data to the local storage
     * @param {string} data
     */
    private storeBusData(data: List<Bus>): void {
        "use strict";
        var colBus = this.db.collection(this.collectionName);
        data.getIterable().forEach( (bus)=>{
            var doc = colBus.document(this.collectionName+"/"+bus.getOrder());
            if(!doc){
                this.logger.info("Creating document: "+this.collectionName+"/"+bus.getOrder());
                doc = colBus.save({ _key: bus.getOrder(), line: bus.getLine() });
            } else if(bus.getLine()!==Strings.dataaccess.bus.blankLine && doc.line!==bus.getLine()){
                colBus.update(doc, { line: bus.getLine() });
            }
        }, this);
    }

    /**
     * Does the request to the external server and retrieves the data
     * @returns {any}
     */
    private requestFromServer(): Object {
        "use strict";
        var config: any = Config.environment.provider;
        var http: HttpRequest = new HttpRequest();
        
        var options: any = {
            url: 'http://' + config.host + config.path.bus,
            headers: {
                'Accept': '*/*',
                'Cache-Control': 'no-cache'
            },
            json: true
        };
        try {
            var response: any = http.get(options, true);
            return this.respondRequest(response[0]);
        } catch (e) {
            this.logger.error(e);
            e.type = Strings.keyword.error;
            return e;
        }
    }

    /**
     * Verifies the request response status and returns the correct output
     * @param {any} response
     * @returns {any}
     */
    private respondRequest(response: any): Object {
        "use strict";
        switch (response.statusCode) {
            case 200:
                this.logger.info(Strings.dataaccess.all.request.ok);
                return response.body;
            case 302:
                this.logger.alert(Strings.dataaccess.all.request.e302);
                return { type: Strings.keyword.error, code: response.statusCode };
            case 404:
                this.logger.alert(Strings.dataaccess.all.request.e404);
                return { type: Strings.keyword.error, code: response.statusCode };
            case 503:
                this.logger.alert(Strings.dataaccess.all.request.e503);
                return { type: Strings.keyword.error, code: response.statusCode };
            default:
                this.logger.error('(' + response.statusCode + ') ' + Strings.dataaccess.all.request.default);
                return { type: Strings.keyword.error, code: response.statusCode };
        }
    }
}
export = BusDataAccess;