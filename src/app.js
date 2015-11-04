'use strict';
/* global process, global; */
const BusDAO              = require('./dao/busDAO');
const BusDownloader       = require('./downloader/busDownloader');
const BusUtils            = require('./utils/busUtils');
const Config              = require('./config');
const Core                = require('./core');
const Database            = Core.Database;
const Itinerary           = require('./model/itinerary');
const ItineraryDAO        = require('./dao/itineraryDAO');
const ItineraryDownloader = require('./downloader/itineraryDownloader');
const LoggerFactory       = Core.LoggerFactory;
const spawn               = require('co');

const logger = LoggerFactory.getRuntimeLogger();
const provider = Config.provider;
const timeout = provider.updateInterval;
var db, itineraries, busDAO, itineraryDAO;

function getURL(bustype) {
    return `http://${provider.host}${provider.path.bus[bustype.toUpperCase()]}`;
}

function prepareItineraries(itiList) {
    var itineraries = {};
    itiList.forEach( (itinerary) => {
        itineraries[itinerary.line] = itinerary;
    });
    return itineraries;
}

function* iteration() {
    logger.info('Downloading bus states...');
    var buses = [];
    try { buses = buses.concat(yield BusDownloader.fromURL(getURL('REGULAR'))); } catch(e) { logger.error(`[${getURL('REGULAR')}] -> ${e.statusCode} ERROR`); }
    try { buses = buses.concat(yield BusDownloader.fromURL(getURL('BRT'))); } catch(e) { logger.error(`[${getURL('BRT')}] -> ${e.statusCode} ERROR`); }
    
    logger.info(`${buses.length} found.`);
    logger.info('Processing...');
    
    for (var key in buses) {
        var bus = buses[key];
        if(bus.line==='indefinido') continue;
        var tmpItinerary = itineraries[bus.line];
        if(!tmpItinerary) {
            logger.alert(`[${bus.line}] Itinerary not found. Downloading...`);
            try {
                tmpItinerary = yield ItineraryDownloader.fromLine(bus.line);
                logger.info(`[${bus.line}] Saving Itinerary to database...`);
                yield itineraryDAO.save(tmpItinerary);
                logger.info(`[${bus.line}] Itinerary saved.`);
                itineraries[bus.line] = tmpItinerary;
            } catch(e) {
                if(e.statusCode===404) {
                    logger.info(`[${bus.line}] Itinerary does not exist.`);
                    tmpItinerary = new Itinerary(bus.line, 'desconhecido', '', '', []);
                    yield itineraryDAO.save(tmpItinerary);
                    itineraries[bus.line] = tmpItinerary;
                }
                else logger.error(e.stack);
            }
        }
        buses[key] = BusUtils.identifySense(bus, tmpItinerary.spots[0]);
    };
    
    logger.info('Saving data...');
    yield busDAO.commonSave(buses);
    logger.info('Saved to search collection.');
    yield busDAO.historySave(buses);
    logger.info('Saved to history collection.');
        
    setTimeout(() => { spawn(iteration); }, timeout);
}

spawn(function*(){
    logger.info('Starting the server...');
    db = yield Database.connect();
    busDAO = new BusDAO(db);
    itineraryDAO = new ItineraryDAO(db);
    logger.info('Retrieving itineraries...');
    itineraries = prepareItineraries(yield itineraryDAO.getAll());
    logger.info(`Itineraries retrieved: ${Object.keys(itineraries).length}`);
    spawn(iteration);
})
.catch(function(error) {
    logger.error(error.stack);
    process.exit(1);
});