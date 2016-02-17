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
const MainProcess = process;

var db, itineraries, busesCache, busDAO, itineraryDAO;

function getURL(bustype) {
    return `http://${provider.host}${provider.path.bus[bustype.toUpperCase()]}`;
}

function prepareBuses(busList) {
    var buses = {};
    busList.forEach( (bus) => {
        buses[bus.order] = bus;
    });
    return buses;
}

function prepareItineraries(itiList) {
    var itineraries = {};
    itiList.forEach( (itinerary) => {
        itineraries[itinerary.line] = itinerary;
    });
    return itineraries;
}

function* loadItinerary(line) {
    var tmpItinerary = itineraries[line];
    if(!tmpItinerary) {
        logger.alert(`[${line}] Itinerary not found. Downloading...`);
        try {
            tmpItinerary = yield ItineraryDownloader.fromLine(line);
            logger.info(`[${line}] Saving Itinerary to database...`);
            yield itineraryDAO.save(tmpItinerary);
            logger.info(`[${line}] Itinerary saved.`);
            itineraries[line] = tmpItinerary;
        } catch(e) {
            if(e.statusCode===404) 
                logger.error(`[${line}] Itinerary does not exist.`);
            else if(e.statusCode===403)
                logger.error(`[${line}] Access forbidden to the Itinerary data.`);
            else logger.error(e.stack);
            
            tmpItinerary = new Itinerary(line);
            yield itineraryDAO.save(tmpItinerary);
            itineraries[line] = tmpItinerary;
        }
    }
    return tmpItinerary;
}

function* iteration() {
    logger.info('Downloading bus states...');
    var busList = [];
    try { busList = busList.concat(yield BusDownloader.fromURL(getURL('REGULAR'))); } catch(e) { logger.error(`[${getURL('REGULAR')}] -> ${e.statusCode} ERROR`); }
    try { busList = busList.concat(yield BusDownloader.fromURL(getURL('BRT'))); } catch(e) { logger.error(`[${getURL('BRT')}] -> ${e.statusCode} ERROR`); }
    
    logger.info(`${busList.length} found. Processing...`);
    
    var commonPendingSave = [], historyPendingSave = [];
    
    for (var bus of busList) {
        if(bus.line==='indefinido') continue;
        var tmpItinerary = yield loadItinerary(bus.line);
        
        // If the same bus is already cached, update it's cached information and write to database
        if(busesCache[bus.order]) {
            var tmp = busesCache[bus.order];
            if(tmp.timestamp.getTime()!==bus.timestamp.getTime()) {
                // Bus has different timestamp from the one cached
                bus = yield BusUtils.identifyDirection(bus, tmpItinerary);
                logger.info(`[${bus.order}] Updated direction: ${bus.sense}`);
                
                // Add to pending history updates
                historyPendingSave.push(bus);
                tmp.timestamp = bus.timestamp;
                tmp.latitude = bus.latitude;
                tmp.longitude = bus.longitude;
                tmp.speed = bus.speed;
                tmp.direction = bus.direction;
                tmp.sense = bus.sense;
                if(tmp.line!==bus.line) {
                    logger.info(`[${bus.order}] ${tmp.line} -> ${bus.line}`);
                    tmp.line = bus.line;
                }
                
                try {
                    // Update current database
                    yield tmp.save();
                } catch (e) {
                    logger.error(e.stack);
                }
            }
        }
        // If the bus is not cached, find its direction and add it to a list to be saved.
        else {
            bus = yield BusUtils.identifyDirection(bus, tmpItinerary);
            logger.info(`[${bus.order}] Direction: ${bus.sense}`);
            
            commonPendingSave.push(bus);
            historyPendingSave.push(bus);
        }
    }
    
    try {
        // Push new data to database
        if(commonPendingSave.length>0) {
            logger.info('Saving data...');
            yield busDAO.commonSave(commonPendingSave);
            logger.info(`Saved ${commonPendingSave.length} docs to search collection.`);
        } else logger.info('There was no new data to store.');
        
        if(historyPendingSave.length>0) {
            yield busDAO.historySave(historyPendingSave);
            logger.info(`Saved ${historyPendingSave.length} docs to history collection.`);
        } else logger.info('There was no new data to store in history.');
        
        // If there is new data, refresh cache to load the stored object.
        if(commonPendingSave.length>0 || historyPendingSave.length>0) {
            busesCache = prepareBuses(yield busDAO.getAll());
        }
    } catch (e) {
        logger.error(e);
    }
    
    setTimeout(() => { spawn(iteration); }, timeout);
}

spawn(function*(){
    logger.info('Starting the server...');
    db = yield Database.connect();
    busDAO = new BusDAO(db);
    itineraryDAO = new ItineraryDAO(db);
    logger.info('Loading buses...');
    busesCache = prepareBuses(yield busDAO.getAll());
    logger.info('Loading itineraries...');
    itineraries = prepareItineraries(yield itineraryDAO.getAll());
    logger.info(`Itineraries retrieved: ${Object.keys(itineraries).length}`);
    spawn(iteration);
})
.catch(function(error) {
    logger.fatal(error.stack);
    MainProcess.exit(1);
});