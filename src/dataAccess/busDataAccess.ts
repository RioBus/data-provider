import Bus             = require("../domain/entity/bus");
import BusModelMap     = require("../domain/modelMap/busModelMap");
import DbContext       = require("../core/database/dbContext");
import Factory         = require("../common/factory");
import HistoryModelMap = require("../domain/modelMap/historyModelMap");
import HttpRequest     = require("../core/httpRequest");
import IBulk           = require("../core/database/iBulk");
import ICollection     = require("../core/database/iCollection");
import IDataAccess     = require("./iDataAccess");
import Itinerary       = require("../domain/entity/itinerary");
import Logger          = require("../common/logger");
import $inject         = require("../core/inject");
import BusUtils        = require("../domain/busUtils");

declare var Config, Strings, database;

/**
 * DataAccess responsible for managing data access to the data stored in the
 * external server.
 *
 * @class BusDataAccess
 * @constructor
 */
class BusDataAccess implements IDataAccess {

    private logger: Logger;
    private db: DbContext;
    private bus: ICollection<Bus>;
    private history: ICollection<Bus>;

    /**
     * Initializes the dataAccess to do operation over bus data
     * @returns {IDataAccess}
     */
    public constructor(private dataAccess: IDataAccess = $inject("dataAccess/itineraryDataAccess")) {
        this.logger = Factory.getServerLogger();
        this.db = database;
        this.bus = this.db.collection<Bus>(new BusModelMap());
        this.history = this.db.collection<Bus>(new HistoryModelMap());
    }

    /**
     * Retrieves the bus data from the external server
     * @param {Object} storage - { buses, itineraries }
     * @returns {Bus[]}
     */
	public retrieve(storage: any): Object {
        return this.requestFromServer(storage);
    }

    /**
     * Saves the bus list to the database
     * @param {Bus[]} buses
     * @returns {void}
     */
    public create(buses: Bus[]): void {
        this.logger.info(Strings.dataaccess.bus.creating);
        var busBulk: IBulk<Bus> = this.bus.initBulk(false, { w: 0 });
        var historyBulk: IBulk<Bus> = this.history.initBulk(false, { w: 0 });
        buses.forEach( (bus: Bus) => {
            if(bus===null || bus===undefined) return;
            busBulk.find({ order: bus.getOrder() }).removeOne();
            busBulk.insert(bus);
            historyBulk.insert(bus);
        }, this);
        try {
            busBulk.execute();
            historyBulk.execute();
        } catch (e) {
            this.logger.error(e);
        }
    }

    /**
     * Not apply
     * @returns {void}
     */
	public update(...args: any[]): any {}

    /**
     * Not apply
     * @returns {void}
     */
	public delete(...args: any[]): any {}

    /**
     * Does the request to the external server and retrieves the data
     * @param {Object} storage - { buses, itineraries }
     * @returns {Object}
     */
    private requestFromServer(storage: any): Object {
        var http: HttpRequest = new HttpRequest();
        var config: any = Config.environment.provider;
        var endpoints: any = config.path.bus;
        var options: any = {
            timeout: 20000,
            headers: { 'Accept': '*/*', 'Cache-Control': 'no-cache'},
            json: true
        };
        
        Object.keys(endpoints).forEach( (key)=>{
            var uri: string = endpoints[key];
            options.url = 'http://' + config.host + uri;
            try{
                var response: any = http.get(options);
                storage = this.respondRequest(response, storage, key);
            } catch (e) {
                this.logger.error(e.stack);
            }
        }, this);
        return storage;
    }

    /**
     * Verifies the request response status and returns the correct output
     * @param {Object} response
     * @param {Object} storage - { buses, itineraries }
     * @param {string} key - Used in the log to identify wheter the data is from REGULAR buses or BRT
     * @returns {Object}
     */
    private respondRequest(response: any, storage: any, key: string): Object {
        switch (response.statusCode) {
            case 200:
                this.logger.info("["+key+"] "+Strings.dataaccess.all.request.ok);
                return this.parseBody(response.body, storage, key);
            case 302:
                this.logger.alert("["+key+"] "+Strings.dataaccess.all.request.e302);
                break;
            case 404:
                this.logger.alert("["+key+"] "+Strings.dataaccess.all.request.e404);
                break;
            case 503:
                this.logger.alert("["+key+"] "+Strings.dataaccess.all.request.e503);
                break;
            default:
                this.logger.error("["+key+"] ("+response.statusCode+")"+Strings.dataaccess.all.request.error);
                break;
        }
        return [];
    }

    /**
     * Parses the request's body and return the parsed objects
     * @param {Object} body
     * @param {Object} storage - { buses, itineraries }
     * @param {string} key - Used in the log to identify wheter the data is from REGULAR buses or BRT
     * @returns {Object}
     */
    private parseBody(body: any, storage: any, key: string): Object {
        var busList: Bus[] = new Array<Bus>();
        
        if (!body.DATA) {
            this.logger.error(Strings.error.json);
            return busList;
        }
        if(body.COLUMNS.length<=1){
            this.logger.error("["+key+"] "+Strings.dataaccess.bus.noBuses);
            return busList;
        }
        var data = body.DATA;
        //let columns = body.COLUMNS;
        // columns: ['DATAHORA', 'ORDEM', 'LINHA', 'LATITUDE', 'LONGITUDE', 'VELOCIDADE', 'DIRECAO']
        
        data.forEach( (d) => {
            var bus: Bus = new Bus(d[2], d[1], d[5], d[6], d[3], d[4], d[0]);
            var line: string = bus.getLine().toString();
            if (line === ""){
                bus.setLine(Strings.dataaccess.bus.blankLine);
                bus.setSense(Strings.dataaccess.bus.blankSense);
            } else {
                if(storage.itineraries[line]===undefined) storage.itineraries[line] = this.dataAccess.retrieve(line);
                var itinerary: Itinerary = storage.itineraries[line];
                var startPoint: any = itinerary.getSpots()[0];
                bus.setSense(itinerary.getDescription());
                bus = BusUtils.identifySense(bus, startPoint);
            }
            busList.push(bus);
        }, this);
        if(busList) storage.buses = storage.buses.concat(busList);
        return storage;
    }
}
export = BusDataAccess;