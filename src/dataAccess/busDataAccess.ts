import Bus           = require("../domain/entity/bus");
import BusModelMap   = require("../domain/modelMap/busModelMap");
import Config        = require("../config");
import DbContext     = require("../core/database/dbContext");
import Factory       = require("../common/factory");
import HttpRequest   = require("../core/httpRequest");
import IDataAccess   = require("./iDataAccess");
import ICollection   = require("../core/database/iCollection");
import Itinerary     = require("../domain/entity/itinerary");
import ItinerarySpot = require("../domain/entity/itinerarySpot");
import Logger        = require("../common/logger");
import Strings       = require("../strings");
import $inject       = require("../core/inject");

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
    private collectionName: string = "bus";
    private historyCollectionName: string = "bus_history";
    private bus: ICollection<Bus>;
    private history: ICollection<Bus>;

    /**
     * Initializes the dataAccess to do operation over bus data
     * @returns {IDataAccess}
     */
    public constructor(private dataAccess: IDataAccess = $inject("dataAccess/itineraryDataAccess")) {
        this.logger = Factory.getServerLogger();
        this.db = new DbContext();
        this.bus = this.db.collection<Bus>(this.collectionName, new BusModelMap());
        this.history = this.db.collection<Bus>(this.historyCollectionName, new BusModelMap());
    }

    /**
     * Retrieves the bus data from the external server
     * @param {any} itineraries
     * @returns {Bus[]}
     */
	public retrieve(itineraries: any): Bus[] {
        return this.requestFromServer(itineraries);
    }

    /**
     * Saves the bus list to the database
     * @param {Bus[]} buses
     * @returns {void}
     */
    public create(buses: Bus[]): void {
        buses.forEach( (bus: any) => {
            if(bus===null || bus===undefined) return;
            delete bus._id; // Is being firstly created, will never have an id here.
            bus.line += "";
            if(bus.line===Strings.dataaccess.bus.blankLine){
                var latest: Bus = this.history.findOne({order: bus.order}, {sort: [["timestamp", "DESC"]]});
                if(latest!==null && latest.getLine()!==Strings.dataaccess.bus.blankLine){
                    bus.line = latest.getLine().toString();
                    bus.sense = latest.getSense();
                }
            }
            var history: any = this.history.findOrCreate(bus);
            delete history._id;
            this.bus.update({ order: history.getOrder() }, history, { upsert: true });
        }, this);
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
     * Gets the ItinerarySpot nearest to Bus position from the given Itinerary
     * @param {Bus} bus
     * @param {Itinerary} itinerary
     * @returns {ItinerarySpot}
     */
    private getNearest(bus: Bus, itinerary: Itinerary): ItinerarySpot {
        var nearest: ItinerarySpot = null;
        var factor: number = Math.pow(10,5);
        var nearestNormal: number = 99 * factor;
        
        itinerary.getSpots().forEach( (current)=>{
            if(nearest===null) nearest = current;
            else {
                var currentLongitude: number = current.getLongitude() * factor;
                var currentLatitude: number = current.getLatitude() * factor;
                var currentNormal: number = Math.sqrt( currentLatitude^2 + currentLongitude^2 );
                if(nearestNormal > currentNormal){
                    nearestNormal = currentNormal;
                    nearest = current;
                }
            }
        });
        return nearest;
    }

    /**
     * Does the request to the external server and retrieves the data
     * @returns {any}
     */
    private requestFromServer(itineraries: any): any {
        var config: any = Config.environment.provider;
        var http: HttpRequest = new HttpRequest();

        var options: any = {
            timeout: 20000,
            headers: { 'Accept': '*/*', 'Cache-Control': 'no-cache'},
            json: true
        };
        
        try {
            var buses: Bus[] = new Array<Bus>();
            var self = this;
            config.path.bus.forEach( (uri)=>{
                options.url = 'http://' + config.host + uri;
                var response: any = http.get(options);
                var data: any = self.respondRequest(response, itineraries);
                itineraries = data.itineraries;
                buses = buses.concat(data.buses);
            });
            return { buses: buses, itineraries: itineraries };
        } catch (e) {
            this.logger.error(e.stack);
            e.type = Strings.keyword.error;
            return [];
        }
    }

    /**
     * Verifies the request response status and returns the correct output
     * @param {any} response
     * @param {any} itineraries
     * @returns {any}
     */
    private respondRequest(response: any, itineraries: any): any {
        switch (response.statusCode) {
            case 200:
                this.logger.info(Strings.dataaccess.all.request.ok);
                return this.parseBody(response.body, itineraries);
            case 302:
                this.logger.alert(Strings.dataaccess.all.request.e302);
                break;
            case 404:
                this.logger.alert(Strings.dataaccess.all.request.e404);
                break;
            case 503:
                this.logger.alert(Strings.dataaccess.all.request.e503);
                break;
            default:
                this.logger.error('(' + response.statusCode + ') ' + Strings.dataaccess.all.request.error);
                break;
        }
        return [];
    }

    /**
     * Parses the request's body and return the parsed objects
     * @param {any} body
     * @param {any} itineraries
     * @returns {any}
     */
    private parseBody(body: any, itineraries: any): any {
        var busList: Bus[] = new Array<Bus>();
        
        if (!body.DATA) {
            this.logger.error(Strings.dataaccess.server.jsonError);
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
                if(itineraries[line]===undefined) itineraries[line] = this.dataAccess.retrieve(line);
                var itinerary: Itinerary = itineraries[line];
                var nearest: ItinerarySpot = this.getNearest(bus, itinerary);
                if(nearest!==null && nearest.isReturning()){
                    var description: string[] = itinerary.getDescription().split(" X ");
                    var tmp: string = description[0];
                    description[0] = description[1];
                    description[1] = tmp;
                    bus.setSense(description.join(" X "));
                }
                else bus.setSense(itinerary.getDescription());
            }
            busList.push(bus);
        }, this);
            
        return { buses: busList, itineraries: itineraries };
    }
}
export = BusDataAccess;