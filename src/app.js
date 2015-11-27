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

var db, itineraries, buses, busDAO, itineraryDAO;

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

function* iteration() {
    logger.info('Downloading bus states...');
    var busList = [];
    try { busList = busList.concat(yield BusDownloader.fromURL(getURL('REGULAR'))); } catch(e) { logger.error(`[${getURL('REGULAR')}] -> ${e.statusCode} ERROR`); }
    try { busList = busList.concat(yield BusDownloader.fromURL(getURL('BRT'))); } catch(e) { logger.error(`[${getURL('BRT')}] -> ${e.statusCode} ERROR`); }
    
    logger.info(`${busList.length} found.`);
    logger.info('Processing...');
    
    var commonList = [], historyList = [], countSearch = 0, countHistory = 0;
    
    for (var bus of busList) {
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
                if(e.statusCode===404) 
                    logger.error(`[${bus.line}] Itinerary does not exist.`);
                else if(e.statusCode===403)
                    logger.error(`[${bus.line}] Access forbidden to the Itinerary data.`);
                else logger.error(e.stack);
                
                tmpItinerary = new Itinerary(bus.line, 'desconhecido', '', '', []);
                yield itineraryDAO.save(tmpItinerary);
                itineraries[bus.line] = tmpItinerary;
            }
        }
        bus = BusUtils.identifySense(bus, tmpItinerary.spots[0], tmpItinerary.description);
        if(buses[bus.order]) {
            var tmp = buses[bus.order];
            if(tmp.timestamp!==bus.timestamp) {
                historyList.push(bus);
                countHistory++;
                tmp.timestamp = bus.timestamp;
                tmp.latitude = bus.latitude;
                tmp.longitude = bus.longitude;
                tmp.speed = bus.speed;
                tmp.direction = bus.direction;
                if(tmp.line!==bus.line) {
                    logger.info(`[${bus.order}] ${tmp.line} -> ${bus.line}`);
                    tmp.line = bus.line;
                }
                tmp = BusUtils.identifySense(tmp, tmpItinerary.spots[0], tmpItinerary.description);
                try {
                    yield tmp.save();
                    countSearch++;
                } catch (e) {
                    logger.error(e.stack);
                }
            }
        } else {
            commonList.push(bus);
            historyList.push(bus);
            countSearch++;
            countHistory++;
        }
    };
    
    try {
        if(commonList.length>0) {
            logger.info('Saving data...');
            yield busDAO.commonSave(commonList);
            logger.info(`Saved ${countSearch} docs to search collection.`);
        } else logger.info('There were no new data to store.');
        
        if(historyList.length>0) {
            yield busDAO.historySave(historyList);
            logger.info(`Saved ${countSearch} docs to history collection.`);
        } else logger.info('There were no new data to store in history.');
    } catch (e) {
        logger.error(e);
    }
    buses = prepareBuses(yield busDAO.getAll());
    setTimeout(() => { spawn(iteration); }, timeout);
}

spawn(function*(){
    logger.info('Starting the server...');
    db = yield Database.connect();
    busDAO = new BusDAO(db);
    itineraryDAO = new ItineraryDAO(db);
    logger.info('Loading buses...');
    buses = prepareBuses(yield busDAO.getAll());
    logger.info('Loading itineraries...');
    itineraries = prepareItineraries(yield itineraryDAO.getAll());
    logger.info(`Itineraries retrieved: ${Object.keys(itineraries).length}`);
    spawn(iteration);
})
.catch(function(error) {
    logger.fatal(error.stack);
    MainProcess.exit(1);
});