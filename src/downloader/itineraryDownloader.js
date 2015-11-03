'use strict';
const Core = require('../core');
const Http = Core.Http;
const Itinerary = require('../model/itinerary');
const LoggerFactory = Core.LoggerFactory;
const Spot = require('../model/spot');
const Strings = require('../strings');
const Config = require('../config');

const logger = LoggerFactory.getRuntimeLogger();

class ItineraryDownloader {
	
	static fromLine(line) {
		let urlConfig = Config.provider;
		var url = `http://${urlConfig.host}${urlConfig.path.itinerary.replace('$$', line)}`;
		return ItineraryDownloader.fromURL(url);
	}
	
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
					break;
			}
			return null;
		});
	}
	
	static parseBody(data) {
        var description, line, agency, keywords;
        var spots = [];
         
        var body = data.toString().replace(/\r/g, "").replace(/\"/g, "").split("\n");
        body.shift(); // Removes the CSV header line with column names
        // columns: ["linha", "descricao", "agencia", "sequencia", "shape_id", "latitude", "longitude"]
        
        body.forEach( (iti)=>{
            if(iti.length<=0) return;
            var it = iti.split(",");
            
            if(agency===undefined)      agency = it[2];
            if(description===undefined) description = it[1];
            if(line===undefined)        line = it[0];
            
            // Transforming the external data into an application's known
            var finalDescription = it[1].split("-");
            finalDescription.shift();
            description = finalDescription.join("-");
            spots.push(new Spot(parseFloat(it[5]), parseFloat(it[6])));
        });
        var consortium = ItineraryDownloader.identifyConsortium(line);
        keywords = [line.toString(), agency.toString(), consortium].concat(description.split(" X ")).join(",");
        keywords = keywords.replace("(", " ").replace(")", " ").replace("-", " ").replace(/\s+/g, " ").replace(/^\s|\s$/g, "").replace(/,/g, " ");
        
        return new Itinerary(line, description, agency, keywords, spots);
	}
    
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