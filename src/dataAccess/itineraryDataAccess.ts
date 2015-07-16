import Config            = require("../config");
import Factory           = require("../common/factory");
import File              = require("../core/file");
import ICollection       = require("../core/database/iCollection");
import HttpRequest       = require("../core/httpRequest");
import IDataAccess       = require("./iDataAccess");
import Itinerary         = require("../domain/entity/itinerary");
import ItinerarySpot     = require("../domain/entity/itinerarySpot");
import ItineraryModelMap = require("../domain/modelMap/itineraryModelMap");
import List              = require("../common/tools/list");
import Logger            = require("../common/logger");
import Strings           = require("../strings");
import DbContext         = require("../core/database/dbContext");
import Sync              = require("../core/sync");

/**
 * DataAccess referred to Itinerary stored data
 *
 * Operates over Itinerary data
 * @class ItineraryDataAccess
 */
class ItineraryDataAccess implements IDataAccess{
    
    private logger: Logger;
    private db: DbContext;
    private collection: ICollection<Itinerary>;
    private collectionName: string = "itinerary";

    public constructor(){
        this.logger = Factory.getLogger();
        this.db = new DbContext();
        this.collection = this.db.collection<Itinerary>(this.collectionName, new ItineraryModelMap());
    }
    
    /**
     * Not apply
     * @return void
     */
	public update(...args: any[]): any {}
    
    /**
     * Not apply
     * @return void
     */
	public delete(...args: any[]): any {}
    
    /**
     * Saves the Itinerary to the repository
     * @param {Itinerary} itinerary The Itinerary object to be saved
     * @return {Itinerary} 
     */
    public create(itinerary: Itinerary): Itinerary {
        var saved: Itinerary = this.collection.save(itinerary);
        this.logger.info("["+saved.getLine()+"] "+Strings.dataaccess.itinerary.stored);
        return saved;
    }
    
    /**
     * Returns the Itinerary data from the repository.
     * @param {string} (Optional) data Itinerary identifier
     * @return {Itinerary | Itinerary[]}
     */
	public retrieve(data?: string): Itinerary | Itinerary[] {
        return (data!==undefined)? this.getItinerary(data) : this.getItineraries();
    }

    /**
     * Retrieves the Itinerary given a line
     * @param {string} line
     * @return {Itinerary}
     */
    public getItinerary(line: string): Itinerary {
        this.logger.info(Strings.dataaccess.itinerary.searching+line);
        var list: Array<Itinerary> = this.collection.find({line: ""+line});
        if(list.length>0){
            return list[0];
        } else {
            var itinerary: Itinerary = this.requestFromServer(line);
            return this.create(itinerary);
        }
    }

    /**
     * Retrieves the Itinerary list
     * @return {Itinerary[]}
     */
    public getItineraries(): Itinerary[] {
        this.logger.info(Strings.dataaccess.itinerary.retrieving);
        return this.collection.find();
    }

    /**
     * Retrieves the Itinerary data from the external server
     * @param {string} line
     * @return Itinerary[]
     */
    private requestFromServer(line: string): Itinerary {
        var config: any = Config.environment.provider;
        var http: HttpRequest = new HttpRequest();
        var empty: Itinerary = new Itinerary(line, Strings.dataaccess.bus.blankSense, "", []);

        var options: any = {
            url: 'http://' + config.host + config.path.itinerary.replace("$$", line),
            headers: {'Accept': '*/*','Cache-Control': 'no-cache'},
            json: true
        };
        try {
            this.logger.info("["+line+"] "+Strings.dataaccess.itinerary.downloading);
            var response: any = http.get(options);
            var itinerary: Itinerary = this.respondRequest(response);
            if(itinerary===null) return empty; 
            return itinerary;
        } catch (e) {
            this.logger.error(e.stack);
            return empty;
        }
    }

    /**
     * Verifies the request response status and returns the correct output
     * @param {*} response
     * @return List<Itinerary>
     * */
    private respondRequest(response: any): Itinerary {
        "use strict";
        switch(response.statusCode){ // Verifying response statusCode
            case 200:
                return this.parseBody(response.body);
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
                this.logger.alert('('+response.statusCode+') '+Strings.dataaccess.all.request.default);
                break;
        }
        return null;
    }

    /**
     * Parses the request's body and return the parsed objects
     * @param {any} data
     * @returns {Itinerary}
     */
    private parseBody(data: string): Itinerary {
        var returning: number = 0, description: string, line: string, agency: string;
        var spots: ItinerarySpot[] = new Array<ItinerarySpot>();
         
        var body = data.toString().replace(/\r/g, "").replace(/\"/g, "").split("\n");
        body.shift(); // Removes the CSV header line with column names
        // columns: ["linha", "descricao", "agencia", "sequencia", "shape_id", "latitude", "longitude"]
        
        body.forEach( (iti)=>{
            if(iti.length<=0) return;
            var it: string[] = iti.split(",");
            
            if(agency===undefined)      agency = it[2];
            if(description===undefined) description = it[1];
            if(line===undefined)        line = it[0];
            if(parseInt(it[3])==0 && returning==0) returning = 1;
            else if(parseInt(it[3])==0 && returning==1) returning = -1;
            
            // Transforming the external data into an application's known
            var finalDescription: string[] = it[1].split("-");
            finalDescription.shift();
            description = finalDescription.join("-");
            var sequential: number = parseInt(it[3])*returning;
            spots.push(new ItinerarySpot(parseFloat(it[5]), parseFloat(it[6]), (sequential<0)? true: false));
        });
        return new Itinerary(line, description, agency, spots);
    }
}
export = ItineraryDataAccess;