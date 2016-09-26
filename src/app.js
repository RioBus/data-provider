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
    let tmpItinerary = itineraries[line];
    if(!tmpItinerary) {
        logger.alert(`[${line}] Itinerary not found. Downloading...`);
        tmpItinerary = yield ItineraryDownloader.fromLine(line);
        logger.info(`[${line}] Saving Itinerary to database...`);
        itineraries[line] = tmpItinerary;
        yield itineraryDAO.save(tmpItinerary);
        logger.info(`[${line}] Itinerary saved.`);
    }
    return tmpItinerary;
}

function concatBusList(a, b) {
    for(let i=0; i<a.length; i++) {
        for(let j=0; j<b.length; j++) {
            if( ( a[i].order === b[j].order ) && ( parseFloat(b[j].timestamp.getTime()) > parseFloat(a[i].timestamp.getTime()) ) )
                a[i] = b[j];
        }
    }
    return a;
}

function* iteration() {
    logger.info('Downloading bus states...');
    var busList = [];
    busList = busList.concat(yield BusDownloader.fromURL(getURL('REGULAR')));
    busList = busList.concat(yield BusDownloader.fromURL(getURL('REGULAR-NEW')));
    busList = busList.concat(yield BusDownloader.fromURL(getURL('BRT')));

    logger.info(`${busList.length} found. Processing...`);

    var commonPendingSave = [], historyPendingSave = [];
    var commonUpdatedCount = 0;

    for (var bus of busList) {
        if(bus.line==='indefinido') continue;
        var tmpItinerary = yield loadItinerary(bus.line);

        // If the same bus is already cached, update it's cached information and write to database
        if(busesCache[bus.order]) {
            var tmp = busesCache[bus.order];
            if(tmp.timestamp.getTime() !== bus.timestamp.getTime()) {
                // Bus has different timestamp from the one cached
                if (!Config.ignoreDirection) bus = yield BusUtils.identifyDirection(bus, tmpItinerary);
                // logger.info(`[${bus.order}] Updated direction: ${bus.sense}`);

                // Add to pending history updates
                if(!Config.ignoreHistoryCollection) historyPendingSave.push(bus);

                // Update cached object from search collection and save it
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
                    // Update current collection
                    yield tmp.save();
                    commonUpdatedCount++;
                } catch (e) {
                    logger.error(e.stack);
                }
            }
        }
        // If the bus is not cached, find its direction and add it to a list to be saved.
        else {
            if(!Config.ignoreDirection) bus = yield BusUtils.identifyDirection(bus, tmpItinerary);
            // logger.info(`[${bus.order}] Direction: ${bus.sense}`);

            commonPendingSave.push(bus);
            if(!Config.ignoreHistoryCollection) historyPendingSave.push(bus);
        }
    }

    try {
        // Push new data to database
        if(commonPendingSave.length > 0) {
            logger.info('Saving data...');
            yield busDAO.commonSave(commonPendingSave);
        }
        logger.info(`Updated ${commonUpdatedCount} and added ${commonPendingSave.length} docs to search collection.`);

        if(historyPendingSave.length > 0) {
            yield busDAO.historySave(historyPendingSave);
            logger.info(`Added ${historyPendingSave.length} docs to history collection.`);
        } else logger.info('There was no new data to store in history.');

        // If there is new data, refresh cache to load the stored object.
        if(commonPendingSave.length > 0 || historyPendingSave.length > 0) {
            busesCache = prepareBuses(yield busDAO.getAll());
        }
    } catch (e) {
        logger.error(e);
    }

    setTimeout(() => { spawn(iteration).catch(onError); }, timeout);
}

spawn(function*(){
    logger.info('Starting the server...');
    if(Config.ignoreHistoryCollection) logger.alert('Saving to history collection is disabled.');
    if(Config.ignoreDirection) logger.alert('Direction detection is disabled.');

    db = yield Database.connect();
    busDAO = new BusDAO(db);
    itineraryDAO = new ItineraryDAO(db);
    logger.info('Loading buses...');
    busesCache = prepareBuses(yield busDAO.getAll());
    logger.info('Loading itineraries...');
    itineraries = prepareItineraries(yield itineraryDAO.getAll());
    logger.info(`Itineraries retrieved: ${Object.keys(itineraries).length}`);
    spawn(iteration).catch(onError);
}).catch(onError);

function onError(err) {
    logger.fatal(err.stack);
    MainProcess.exit(1);
}
