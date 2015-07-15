import Bus         = require("../domain/entity/bus");
import BusModelMap = require("../domain/modelMap/busModelMap");
import Config      = require("../config");
import DbContext   = require("../core/database/dbContext");
import Factory     = require("../common/factory");
import File        = require("../core/file");
import HttpRequest = require("../core/httpRequest");
import IDataAccess = require("./iDataAccess");
import Itinerary   = require("../domain/entity/itinerary");
import ItinerarySpot = require("../domain/entity/itinerarySpot");
import List        = require("../common/tools/list");
import Logger      = require("../common/logger");
import Strings     = require("../strings");
import $inject     = require("../core/inject");
import ICollection = require("../core/database/iCollection");

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
    private historyCollectionName: string = "bus_history";
    private bus: ICollection<Bus>;
    private history: ICollection<Bus>;

    public constructor(private dataAccess: IDataAccess = $inject("dataAccess/itineraryDataAccess")) {
        this.logger = Factory.getServerLogger();
        this.db = new DbContext();
        this.bus = this.db.collection<Bus>(this.collectionName, new BusModelMap());
        this.history = this.db.collection<Bus>(this.historyCollectionName, new BusModelMap());
    }
    
	public retrieve(itineraries: any): Bus[] {
        return this.requestFromServer(itineraries);
    }
    
    public create(buses: Bus[]): void {
        buses.forEach( (bus: any) => {
            delete bus._id; // Is being firstly created, will never have an id here.
            bus.line += "";
            if(bus.line===Strings.dataaccess.bus.blankLine){
                var latest: Bus = this.history.findOne({order: bus.order}, {sort: [["timestamp", "DESC"]]});
                if(latest!==null && latest.getLine()!==Strings.dataaccess.bus.blankLine){
                    bus.line = latest.getLine().toString();
                    bus.sense = latest.getSense();
                }
            }
            var history: Bus = this.history.findOrCreate(bus);
        }, this);

        var pipeline: any[] = [
            { $sort: { timestamp: -1 } },
            { $group: {
                "_id": "$order",
                "line": { $first: "$line" },
                "timestamp": { $first: "$timestamp" },
                "speed": { $first: "$speed" },
                "direction": { $first: "$direction" },
                "sense": { $first: "$sense" },
                "coordinates": { $first: "$coordinates" },
            } }
        ];
        
        this.bus.remove();
        this.history.aggregate(pipeline, { allowDiskUse: true, out: this.collectionName });
        this.logger.info(buses.length+" documents processed successfully.");
    }
    
	public update(...args: any[]): any {}
    
	public delete(...args: any[]): any {}
    
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
            //url: 'http://' + config.host + config.path.bus,
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
    
    private parseBody(body: any, itineraries: any): any {
        var busList: Bus[] = new Array<Bus>();
        try {
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
                    if(!itineraries[line]){
                        itineraries[line] = this.dataAccess.retrieve(line);
                    }
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
        } catch (e) {
            this.logger.error(e.stack);
        }
        return { buses: busList, itineraries: itineraries };
    }
}
export = BusDataAccess;