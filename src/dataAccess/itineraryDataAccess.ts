import Config      = require("../config");
import Factory     = require("../common/factory");
import File        = require("../core/file");
import HttpRequest = require("../core/httpRequest");
import IDataAccess = require("./iDataAccess");
import Itinerary   = require("../domain/itinerary");
import List        = require("../common/tools/list");
import Logger      = require("../common/logger");
import Strings     = require("../strings");

/**
 * DataAccess referred to Itinerary stored data
 *
 * Does operations over Itinerary data
 * @class ItineraryDataAccess
 * @constructor
 */
class ItineraryDataAccess implements IDataAccess{
    
    private logger: Logger;

    public constructor(){
        this.logger = Factory.getLogger();
    }
    
    public handle(data: any): any{
        if(!(data instanceof List)){
            return this.getItinerary(data);
        }
        this.storeData.apply(data);
    }

    /**
     * Retrieves the Itinerary spots given a line
     * @param {String} line
     * @return List<Itinerary>
     */
    public getItinerary(line: string): List<Itinerary>{
        var filePath = Config.environment.provider.path.output + '/'+ line;
        this.logger.info(Strings.dataaccess.itinerary.searching+line);

        try{
            var file = new File(filePath);
            return JSON.parse(file.read().toString());
        } catch(e){
            var data = this.requestFromServer(line);
            this.storeData(filePath, data);
            return data;
        }
    }

    /**
     * Cached locally the itinerary
     * @param {String} filePath Place to create the file and save the data
     * @param {Array} data Itinerary list to be saved
     * @return List<Itinerary>
     * */
    public storeData(filePath: string, data: List<Itinerary>): void{
        try{
            var file = new File(filePath);
            file.write(JSON.stringify(data.getIterable()));
            this.logger.info(Strings.dataaccess.itinerary.stored);
        } catch(e){
            this.logger.error(e);
            throw e;
        }
    }

    /**
     * Retrieves the Itinerary data from the external server
     * @param {String} line
     * @return List<Itinerary>
     */
    private requestFromServer(line: string): List<Itinerary>{
        "use strict";
        var config = Config.environment.provider;
        var http = new HttpRequest();
        var requestPath = 'http://' + config.host + config.path.itinerary.replace("$$", line);
        this.logger.info(Strings.dataaccess.itinerary.searching+requestPath);
        var response = http.get(requestPath, true);
        console.log(response);
        return this.respondRequest(response);
    }

    /**
     * Verifies the request response status and returns the correct output
     * @param {*} response
     * @return List<Itinerary>
     * */
    private respondRequest(response): List<Itinerary>{
        "use strict";
        var result = new List<Itinerary>();
        switch(response.statusCode){ // Verifying response statusCode
            case 200:
                var body = response.getBody().toString().replace(/\r/g, "").replace(/\"/g, "").split("\n");
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