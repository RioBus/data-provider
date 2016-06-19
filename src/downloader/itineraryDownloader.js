'use strict';
const Core = require('../core');
const Http = Core.Http;
const Itinerary = require('../model/itinerary');
const ItinerarySpot = require('../model/itinerarySpot');
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
	static fromLine(line, timeout) {
		let urlConfig = Config.provider;
		var url = `http://${urlConfig.host}${urlConfig.path.itinerary.replace('$$', line)}`;
		return ItineraryDownloader.fromURL(url, timeout, line);
	}
    
	
    /**
     * Downloads the data from the URL
     * @param {string} url - External provider service address
     * @return {Promise}
     */
    static fromURL(url, timeout, line) {
        return Http.get(url, undefined, timeout)
        .then(response => response, error => error)
        .then( (response) => {
            let msg = `[${url}] -> ${response.statusCode || response.code}`;
            if(response.statusCode>=400) {
                logger.error(msg);
                return ItineraryDownloader.parseBody(line, '');
            }
            logger.info(msg);
            return ItineraryDownloader.parseBody(line, response.body);
        });
    }

    /**
     * Preprocesses the request's output body 
     * @param {string} lineQuery - Requested line 
     * @param {string} data - Request body
     * @return {Itinerary}
     */
	static parseBody(lineQuery, data) {
        var description, line, agency, keywords, seq, returning;
        var i = 0;
        var spots = [];
         
        var body = data.toString().replace(/\r/g, "").replace(/\"/g, "").split("\n");
        body.shift(); // Removes the CSV header line with column names
        // columns: ["linha", "descricao", "agencia", "sequencia", "shape_id", "latitude", "longitude"]
        if (body.length===0) return new Itinerary(lineQuery);
        
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
            spots.push(new ItinerarySpot(parseFloat(it[5]), parseFloat(it[6]), returning));
            
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