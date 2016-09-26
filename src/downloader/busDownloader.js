'use strict';
const Bus = require('../model/bus');
const BusUtils = require('../utils/busUtils');
const Config = require('../config');
const Core = require('../core');
const Http = Core.Http;
const ItineraryDownloader = require('./itineraryDownloader');
const LoggerFactory = Core.LoggerFactory;
const Strings = require('../strings');

const logger = LoggerFactory.getRuntimeLogger();

/**
 * Downloads the latest Bus data from the external provider service
 * @class {BusDownloader}
 */
class BusDownloader {

    /**
     * Downloads the data from the URL
     * @param {string} url - External provider service address
     * @return {Promise}
     */
    static fromURL(url) {
        return Http.get(url, undefined, Config.provider.updateTimeout)
        .then(response => response, error => error)
        .then( response => {
            switch (response.statusCode) {
                case 200:
                    logger.info(`[${url}] -> ${response.statusCode}`);
                    return BusDownloader.parseBody(response.body);
                default:
                    logger.error(`[${url}] -> ${response.statusCode || response.code}`);
                    return BusDownloader.parseBody({ DATA: [], COLUMNS: [] });
            }
        });
    }

    /**
     * Preprocesses the request's output body 
     * @param {string} body - Request body
     * @return {Bus[]}
     */
    static parseBody(body) {
        var buses = [];

        if (!body.DATA) {
            logger.error(Strings.error.json);
            return buses;
        }
        if(body.COLUMNS.length<=1){
            logger.error(Strings.error.noBuses);
            return buses;
        }
        var data = body.DATA;
        //let columns = body.COLUMNS;
        // columns: ['DATAHORA', 'ORDEM', 'LINHA', 'LATITUDE', 'LONGITUDE', 'VELOCIDADE', 'DIRECAO']

        data.forEach( (d) => {
            var bus = new Bus(d[2], d[1], d[5], d[6], d[3], d[4], d[0]);
            buses.push(bus);
        }, this);
        return buses;
    }
}
module.exports = BusDownloader;