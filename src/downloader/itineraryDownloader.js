'use strict';
const Core = require('../core');
const Http = Core.Http;
const Itinerary = require('../model/itinerary');
const LoggerFactory = Core.LoggerFactory;
const Spot = require('../model/spot');
const Strings = require('../strings');
const Config = require('../config');

const logger = LoggerFactory.getRuntimeLogger();

/**
 * Downloads the latest itinerary data from the external provider service
 * @class {ItineraryDownloader}
 */
class ItineraryDownloader {
	
    /**
     * Downloads the data for a given bus line
     * @param {string} line - Bus line
     * @return {Promise}
     */
	static fromLine(line) {
		let urlConfig = Config.provider;
		var url = `http://${urlConfig.host}${urlConfig.path.itinerary.replace('$$', line)}`;
		return ItineraryDownloader.fromURL(url);
	}
	
    /**
     * Downloads the data from the URL
     * @param {string} url - External provider service address
     * @return {Promise}
     */
	static fromURL(url) {
		return Http.get(url).then( (response) => {
			const status = response.statusCode;
			switch(status) {
				case 200:
					logger.info(`[${url}] -> 200 OK`);
					return ItineraryDownloader.parseBody(response.body);
					break;
				default:
					logger.info(`[${url}] -> ${status} ERROR`);
                    throw response;
					break;
			}
			return null;
		});
	}
	
    /**
     * Preprocesses the request's output body 
     * @param {string} data - Request body
     * @return {Itinerary}
     */
	static parseBody(data) {
        var description, line, agency, keywords, seq, returning;
        var i = 0;
        var spots = [];
         
        var body = data.toString().replace(/\r/g, "").replace(/\"/g, "").split("\n");
        body.shift(); // Removes the CSV header line with column names
        // columns: ["linha", "descricao", "agencia", "sequencia", "shape_id", "latitude", "longitude"]
        
        returning = false;
        body.forEach( (iti)=>{
            if(iti.length<=0) return;
            var it = iti.split(",");
            
            if(agency===undefined)      agency = it[2];
            if(description===undefined) description = it[1];
            if(line===undefined)        line = it[0];
            
            seq = it[3];
            // If the spot's sequential number is 0 and it's not the first one, the next coordinates are returning.
            if (seq == 0 && i != 0) {
                returning = true;
            }
            
            // Transforming the external data into an application's known
            var finalDescription = it[1].split("-");
            finalDescription.shift();
            description = finalDescription.join("-");
            spots.push(new Spot(parseFloat(it[5]), parseFloat(it[6]), returning));
            
            i++;
        });
        var consortium = ItineraryDownloader.identifyConsortium(line);
        keywords = [line.toString(), agency.toString(), consortium].concat(description.split(" X ")).join(",");
        keywords = keywords.replace("(", " ").replace(")", " ").replace("-", " ").replace(/\s+/g, " ").replace(/^\s|\s$/g, "").replace(/,/g, " ");
        
        return new Itinerary(line, description, agency, keywords, spots);
	}
	
    /**
     * Tries to figure out the line consortium
     * @param {string} line - Bus line
     * @return {string}
     */
    static identifyConsortium(line) {
        var consortiums = Object.keys(Strings.consortiums);
        var output = '';
        consortiums.forEach((consortium) => {
            if(Strings.consortiums[consortium].indexOf(line.toString())>-1) output = consortium;
        });
        return output;
    }
}
module.exports = ItineraryDownloader;