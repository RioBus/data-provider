import Bus                  = require("../domain/bus");
import BusList              = require("../domain/busList");
import Config               = require("../config");
import DbContext            = require("../core/database/dbContext");
import Factory              = require("../common/factory");
import File                 = require("../core/file");
import HttpRequest          = require("../core/httpRequest");
import IDataAccess          = require("./iDataAccess");
import Itinerary            = require("../domain/itinerary");
import ItineraryDataAccess  = require("./itineraryDataAccess");
import List                 = require("../common/tools/list");
import Logger               = require("../common/logger");
import Strings              = require("../strings");

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
    private subCollectionName: string = "bus_history";
    private ida: IDataAccess;

    public constructor() {
        this.logger = Factory.getServerLogger();
        this.db = new DbContext;
        this.ida = new ItineraryDataAccess();
    }

    public handle(data?: any): List<Bus> | void {
        if (data === undefined) return this.requestFromServer();
        this.storeBusData(data);
    }

    /**
     * Stores the given data to the local storage
     * @param {string} data
     */
    private storeBusData(data: List<Bus>): void {
        "use strict";
        var colBus = this.db.collection(this.collectionName);
        var colHistory = this.db.collection(this.subCollectionName);
        data.getIterable().forEach( (bus) => {
            try {
                var doc = colBus.document.sync(colBus, bus.getOrder());
                if (bus.getLine() !== Strings.dataaccess.bus.blankLine && doc.line !== bus.getLine()) {
                    this.logger.info(Strings.dataaccess.bus.updating + this.collectionName + "/" + bus.getOrder() + " " + doc.line + "->" + bus.getLine());
                    colBus.update(doc, { line: bus.getLine() });
                }
            } catch (e) {
                if (e.code === Strings.error.notFound) {
                    this.logger.info(Strings.dataaccess.bus.creating + this.collectionName + "/" + bus.getOrder());
                    colBus.save({ _key: bus.getOrder(), line: bus.getLine() });
                } else this.logger.error(e.stack);
            } finally {
                colHistory.save({
                    order: bus.getOrder(),
                    updateTime: bus.getUpdateTime(),
                    speed: bus.getSpeed(),
                    direction: bus.getDirection(),
                    latitude: bus.getLatitude(),
                    longitude: bus.getLongitude(),
                    sense: bus.getSense()
                });
            }
        }, this);
        this.logger.info(data.size()+" records saved successfully.");
    }

    /**
     * Does the request to the external server and retrieves the data
     * @returns {any}
     */
    private requestFromServer(): List<Bus> {
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
            this.logger.error(e.stack);
            e.type = Strings.keyword.error;
            return e;
        }
    }
    
    private getNearest(bus: Bus, itineraries: List<Itinerary>): Itinerary{
        var nearest: Itinerary = new Itinerary(0, bus.getLine(), Strings.dataaccess.bus.blankSense, "", 0, 999, 999);
        var factor: number = Math.pow(10,5);
        var nearestNormal: number = 99 * factor;
        
        itineraries.getIterable().forEach( (current)=>{
            var currentLongitude: number = current.getLongitude() * factor;
            var currentLatitude: number = current.getLatitude() * factor;
            var currentNormal: number = Math.sqrt( currentLatitude^2 + currentLongitude^2 );
            if(nearestNormal > currentNormal){
                nearestNormal = currentNormal;
                nearest = current;
            }
        }, this);
        return nearest;
    }

    /**
     * Verifies the request response status and returns the correct output
     * @param {any} response
     * @returns {any}
     */
    private respondRequest(response: any): List<Bus> {
        "use strict";
        var busList: List<Bus> = new List<Bus>();
        switch (response.statusCode) {
            case 200:
                this.logger.info(Strings.dataaccess.all.request.ok);
                try {
                    var body: any = response.body;
                    if (!body.DATA) {
                        this.logger.error(Strings.dataaccess.server.jsonError);
                        return busList;
                    }
                    var data = body.DATA;
                    //let columns = body.COLUMNS;
                    // columns: ['DATAHORA', 'ORDEM', 'LINHA', 'LATITUDE', 'LONGITUDE', 'VELOCIDADE', 'DIRECAO']
                    var itineraries: any = this.ida.handle();
                    
                    data.forEach( (d) => {
                        var bus: Bus = new Bus(d[2], d[1], d[5], d[6], d[3], d[4], d[0]);
                        var line: string = bus.getLine().toString();
                        if (line === ""){
                            bus.setLine(Strings.dataaccess.bus.blankLine);
                            bus.setSense(Strings.dataaccess.bus.blankSense);
                        } else {
                            if(!itineraries[line]){
                                itineraries[line] = this.ida.handle(line);
                            }
                            var nearest: Itinerary = this.getNearest(bus, itineraries[line]);
                            bus.setSense(nearest.getDescription());
                        }
                        busList.add(bus);
                        //this.logger.info(bus.getOrder()+" added.");
                    }, this);
                } catch (e) {
                    this.logger.error(e.stack);
                }
                return busList;
            case 302:
                this.logger.alert(Strings.dataaccess.all.request.e302);
                return busList;
            case 404:
                this.logger.alert(Strings.dataaccess.all.request.e404);
                return busList;
            case 503:
                this.logger.alert(Strings.dataaccess.all.request.e503);
                return busList;
            default:
                this.logger.error('(' + response.statusCode + ') ' + Strings.dataaccess.all.request.default);
                return busList;
        }
    }
}
export = BusDataAccess;