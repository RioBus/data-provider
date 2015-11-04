'use strict';
const Config   = require('../config');
const Core     = require('../core');
const MapUtils = require('./mapUtils');
const Spot     = require('../model/spot');

const Cache    = Core.Cache;
const Logger   = Core.LoggerFactory.getRuntimeLogger();

class BusUtils {
    
    static currentPositionState(current, past, startPoint) {
        if(!past || !startPoint.latitude || !startPoint.longitude || !current) return 0;
        var pastPosition = new Spot(past.latitude, past.longitude);
        var currentPosition = new Spot(current.latitude, current.longitude);
        var pastDistance = MapUtils.distanceBetween(startPoint, pastPosition);
        var currentDistance = MapUtils.distanceBetween(startPoint, currentPosition);
        if(currentDistance===pastDistance) return 0;
        else if(currentDistance>pastDistance) return 1;
        else return -1;
    }
    
    static readFromCache(busOrder) {
        try { return new Cache(busOrder).retrieve(); }
        catch (e) { return ''; }
    }
    
    static writeToCache(busOrder, content) {
        try {
            new Cache(busOrder).write(JSON.stringify(content));
        } catch (e) {
            Logger.error(e.stack);
        }
    }
    
    static prepareHistory(content, startPoint) {
        var history = (content!=='')? JSON.parse(content) : { startPoint: { latitude: null, longitude: null }, timeline: [] };
        if(history.startPoint.latitude===null && history.startPoint.longitude===null && startPoint) history.startPoint = startPoint;
        return history; 
    }
    
    static timelineHasData(content, timeline) {
        return timeline.some( (value, index, data) => { return JSON.stringify(data[index])===JSON.stringify(content); });
    }
    
    static reduceState(states) {
        states = states.reverse();
        var goal = 2;
        var total = 0;
        var current;
        
        for(var state of states) {
            if(!current) {
                current = state;
                total++;
            } else if(state===current) {
                total++;
                if(total===goal) {
                    return current;
                }
            } else if(state!==current) {
                current = state;
                total = 1;
            }
        }
        return 0;
    }
    
    static prepareSense(sense, sum) {
        var tmp = 'desconhecido';
        if(sum > 0) tmp = sense;
        else if(sum < 0) {
            var tmpSense = sense.split(' X ');
            var aux = tmpSense[1];
            tmpSense[1] = tmpSense[0];
            tmpSense[0] = aux;
            tmp = tmpSense.join(' X ');
        }
        return tmp;
    }
	
    static identifySense(bus, startPoint) {
        var max = Config.historySize;
        var tmp = BusUtils.readFromCache(bus.order);
        var finalState = [];
        
        // Getting the cached information
        var history = BusUtils.prepareHistory(tmp, startPoint); 
        startPoint = new Spot(history.startPoint.latitude, history.startPoint.longitude);
        
        // Preparing current position data
        tmp = { latitude: bus.latitude, longitude: bus.longitude };
        
        // Setting the new position
        if(!BusUtils.timelineHasData(tmp, history.timeline)) history.timeline.push(tmp);
        if(history.timeline.length>max) {
            var overpass = history.timeline.length - max, i = 0;
            while (i++<overpass) history.timeline.shift();
        }
        
        var past = null;
        history.timeline.forEach((step, index) => {
            var tmpState = BusUtils.currentPositionState(step, past, startPoint);
            finalState.push(tmpState);
            past = step;
        });
        
        // Getting the current punctuation
        var reducedState = BusUtils.reduceState(finalState);
        
        // Updating sense
        bus.sense = BusUtils.prepareSense(bus.sense, reducedState);
        
        // Updating the cached data
        BusUtils.writeToCache(bus.order, history);
        
        return bus;
    }
}
module.exports = BusUtils;