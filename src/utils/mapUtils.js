'use strict';
const Config   = require('../config');
const Core     = require('../core');
const Http     = Core.Http;

const logger   = Core.LoggerFactory.getRuntimeLogger();

/**
 * Map helper functions
 * @class {MapUtils}
 */
class MapUtils {
    /**
     * Receives a coordinates object with latitude and longitude and returns
     * the street name corresponding to the coordinates.
     * @param {object} coordinates - Object containing a latitude and a longitude property
     * @return {Promise}
     */
    static streetNameFromCoordinates(coordinates) {
        return MapUtils.reverseGeocodeOSRM(coordinates);
    }

    /**
     * Find the street name using a coordinate using the Open Street Routing Machine API.
     * @param {object} coordinates - Object containing a latitude and a longitude property
     * @return {Promise}
     */
    static reverseGeocodeOSRM(coordinates) {
        var latlng = coordinates.latitude + ',' + coordinates.longitude;
        
        var OSRM = Config.OSRM;
        var url = `http://${OSRM.host}:${OSRM.port}/nearest?loc=${latlng}`;
        
        return Http.get(url).then( (response) => {
            const status = response.statusCode;
            switch(status) {
                case 200:
                    // logger.info(`[${url}] -> 200 OK`);
                    var streetName = response.body.name;
                    return streetName;
                default:
                    logger.error(`[${url}] -> ${status} ERROR: ${response.toString()}`);
                    break;
            }
            return null;
        }).catch(function (err) {
            logger.error(`[${url}] -> ERROR: ${err.toString()}`);
            return null;
        });
    }
}
module.exports = MapUtils;