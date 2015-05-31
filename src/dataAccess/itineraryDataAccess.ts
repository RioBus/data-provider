import Config      = require("../config");
import Factory     = require("../common/factory");
import File        = require("../core/file");
import HttpRequest = require("../core/httpRequest");
import IDataAccess = require("./iDataAccess");
import Itinerary   = require("../domain/itinerary");
import List        = require("../common/tools/list");
import Logger      = require("../common/logger");
import Strings     = require("../strings");
import DbContext   = require("../core/database/dbContext");

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
    private collectionName: string = "itinerary";

    public constructor(){
        this.logger = Factory.getLogger();
        this.db = new DbContext;
    }
    
    public handle(line: string): List<Itinerary>{
        return this.getItinerary(line);
    }

    /**
     * Retrieves the Itinerary spots given a line
     * @param {String} line
     * @return List<Itinerary>
     */
    public getItinerary(line: string): List<Itinerary>{
        this.logger.info(Strings.dataaccess.itinerary.searching+line);
        var itineraryCollection: any = this.db.collection(this.collectionName);
        try{
            var list: Array<any> = itineraryCollection.byExample({ _key: line });
            return this.prepareList(list);
        } catch(e){
            var itineraries: List<Itinerary> = this.requestFromServer(line);
            this.storeData(itineraries);
            return itineraries;
        }
    }
    
    private prepareList(list: Array<any>): List<Itinerary>{
        var itineraries: List<Itinerary> = new List<Itinerary>();
        list.forEach((item)=>{
            itineraries.add(new Itinerary(item.sequential, item._key, item.description, 
                    item.agency, item.shape, item.latitude, item.longitude));
        }, this);
        return itineraries;
    }

    /**
     * Cached locally the itinerary
     * @param {String} filePath Place to create the file and save the data
     * @param {Array} data Itinerary list to be saved
     * @return List<Itinerary>
     * */
    public storeData(itineraries: List<Itinerary>): void{
        var itineraryCollection: any = this.db.collection(this.collectionName);
        itineraries.getIterable().forEach((itinerary)=>{
            itineraryCollection.save({
                _key: itinerary.getLine(),
                latitude: itinerary.getLatitude(),
                tongitude: itinerary.getLongitude(),
                description: itinerary.getDescription(),
                agency: itinerary.getAgency(),
                shape: itinerary.getShape(),
                sequential: itinerary.getSequential()
            });
        }, this);
        this.logger.info(Strings.dataaccess.itinerary.stored);
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
                var returning;
                for(var it in body){
                    if(it.length<=0) continue;
                    it = it.split(",");
                    
                    if(it[3]==0 && returning==0) returning = 1;
                    else if(it[3]==0 && returning==1) returning = -1;
                    // Transforming the external data into an application's known
                    var description = it[1].split('-');
                    description.shift();
                    var itinerary = new Itinerary(it[3]*returning,it[0],description.join('-'),it[2],it[4],it[5],it[6]);
                    result.add(itinerary);
                }
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