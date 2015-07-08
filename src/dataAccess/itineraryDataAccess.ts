import Config      = require("../config");
import Factory     = require("../common/factory");
import File        = require("../core/file");
import IGeolocated = require("../domain/iGeolocated");
import HttpRequest = require("../core/httpRequest");
import IDataAccess = require("./iDataAccess");
import Itinerary   = require("../domain/itinerary");
import List        = require("../common/tools/list");
import Logger      = require("../common/logger");
import Strings     = require("../strings");
import DbContext   = require("../core/database/dbContext");
import Sync        = require("../core/sync");

/**
 * DataAccess referred to Itinerary stored data
 *
 * Does operations over Itinerary data
 * @class ItineraryDataAccess
 * @constructor
 */
class ItineraryDataAccess implements IDataAccess{
    
    private logger: Logger;
    private db: DbContext;
    private collection: any;
    private collectionName: string = "itinerary";

    public constructor(){
        this.logger = Factory.getLogger();
        this.db = new DbContext();
        this.collection = this.db.collection("itinerary", null);
    }
    
    public create(line: string, itineraries: List<Itinerary>): void{
        var structure: any = { line: line, itineraries: itineraries.getIterable() };
        this.collection.save(structure);
        this.logger.info("[" + line + "] " + Strings.dataaccess.itinerary.stored);
    }
    
	public retrieve(data?: string): any {
        return (data!==undefined)? this.getItinerary(data) : this.getItineraries();
    }
    
	public update(...args: any[]): any {}
    
	public delete(...args: any[]): any {}

    /**
     * Retrieves the Itinerary spots given a line
     * @param {String} line
     * @return List<Itinerary>
     */
    public getItinerary(line: string): List<Itinerary>{
        this.logger.info(Strings.dataaccess.itinerary.searching+line);
        try{
            var obj: any = Sync.promise(this.collection, this.collection.document, { line: line });
            return this.prepareList(obj.itineraries);
        } catch (e) {
            var itineraries: List<Itinerary> = this.requestFromServer(line);
            this.create(line, itineraries);
            return itineraries;
        }
    }
    
    public getItineraries(): any{
        /*var cursor = this.db.query("FOR i IN itinerary RETURN {\"line\": i.line, \"itineraries\": i.itineraries}");
        var documents = Sync.promise(cursor, cursor.all);
        var itineraries: any = {};
        if(documents.length>0){
            documents.forEach( (doc) => {
                itineraries[doc.line] = this.prepareList(doc.itineraries);
            }, this);
        }
        return itineraries;*/
    }
    
    private prepareList(list: Array<any>): List<Itinerary>{
        var itineraries: List<Itinerary> = new List<Itinerary>();
        list.forEach((item)=>{
            itineraries.add(new Itinerary(item.sequential, item.line, item.description, 
                    item.agency, item.shape, item.latitude, item.longitude));
        }, this);
        return itineraries;
    }

    /**
     * Retrieves the Itinerary data from the external server
     * @param {String} line
     * @return List<Itinerary>
     */
    private requestFromServer(line: string): List<Itinerary> {
        "use strict";
        var config: any = Config.environment.provider;
        var http: HttpRequest = new HttpRequest();

        var options: any = {
            url: 'http://' + config.host + config.path.itinerary.replace("$$", line),
            headers: {
                'Accept': '*/*',
                'Cache-Control': 'no-cache'
            },
            json: true
        };
        try {
            this.logger.info("["+line+"] "+Strings.dataaccess.itinerary.downloading);
            var response: any = http.get(options);
            return this.respondRequest(response);
        } catch (e) {
            this.logger.error(e.stack);
            return new List<Itinerary>();
        }
    }

    /**
     * Verifies the request response status and returns the correct output
     * @param {*} response
     * @return List<Itinerary>
     * */
    private respondRequest(response: any): List<Itinerary>{
        "use strict";
        var result = new List<Itinerary>();
        switch(response.statusCode){ // Verifying response statusCode
            case 200:
                var body = response.body.toString().replace(/\r/g, "").replace(/\"/g, "").split("\n");
                body.shift(); // Removes the CSV header line with column names
                var returning = 0;
                // columns: ["linha", "descricao", "agencia", "sequencia", "shape_id", "latitude", "longitude"]
                body.forEach( (it)=>{
                    if(it.length<=0) return;
                    it = it.split(",");
                    
                    if(it[3]==0 && returning==0) returning = 1;
                    else if(it[3]==0 && returning==1) returning = -1;
                    // Transforming the external data into an application's known
                    var description = it[1].split("-");
                    description.shift();
                    description = description.join("-");
                    var sequential: number = parseInt(it[3])*returning;
                    if(sequential<0){
                        description = description.split(" X ");
                        var tmp: string = description[0];
                        description[0] = description[1];
                        description[1] = tmp;
                        description = description.join(" X ");
                    }
                    var itinerary = new Itinerary(sequential,it[0],description,it[2],it[4],it[5],it[6]);
                    result.add(itinerary);
                }, this);
                return result;
            case 302:
                this.logger.alert(Strings.dataaccess.all.request.e302);
                return result;
            case 404:
                this.logger.alert(Strings.dataaccess.all.request.e404);
                return result;
            case 503:
                this.logger.alert(Strings.dataaccess.all.request.e503);
                return result;
            default:
                this.logger.alert('('+response.statusCode+') '+Strings.dataaccess.all.request.default);
                return result;
        }
    }
}
export = ItineraryDataAccess;