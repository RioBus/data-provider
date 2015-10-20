import Bus = require("./entity/bus");
import Cache = require("../common/tools/cache");
import IGeolocated = require("../common/iGeolocated");
import MapUtils = require("../common/tools/mapUtils");
import Config = require("../config");

class Spot implements IGeolocated {
    
    public constructor(private latitude: number, private longitude: number) {}
    
    public getLatitude(): number {
        return this.latitude;
    }
    
    public getLongitude(): number {
        return this.longitude;
    }
}

class BusUtils {
    
    private static currentPositionState(current: any, past: any, startPoint: any): number {
        if(!past || !startPoint.latitude || !startPoint.longitude || !current) return 0;
        var pastPosition: Spot = new Spot(past.latitude, past.longitude);
        var currentPosition: Spot = new Spot(current.latitude, current.longitude);
        var pastDistance: number = MapUtils.distanceBetween(startPoint, pastPosition);
        var currentDistance: number = MapUtils.distanceBetween(startPoint, currentPosition);
        if(currentDistance===pastDistance) return 0;
        else if(currentDistance>pastDistance) return 1;
        else return -1;
    }
    
    private static readFromCache(busOrder: string): string {
        try { return new Cache(busOrder).retrieve(); }
        catch (e) { return ""; }
    }
    
    private static writeToCache(busOrder: string, content: any): void {
        new Cache(busOrder).write(JSON.stringify(content));
    }
    
    private static prepareHistory(content: string, startPoint: any): any {
        var history: any = (content!=="")? JSON.parse(content) : { startPoint: { latitude: null, longitude: null }, timeline: [] };
        if(history.startPoint.latitude===null && history.startPoint.longitude===null && startPoint) history.startPoint = startPoint;
        return history; 
    }
    
    private static timelineHasData(content: any, timeline: any): boolean {
        return timeline.some( (value, index, data) => { return JSON.stringify(data[index])===JSON.stringify(content); });
    }
    
    private static reduceState(states: number[]): number {
        states = states.reverse();
        var goal: number = 2;
        var total: number = 0;
        var current: number;
        
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
    
    private static prepareSense(sense: string, sum: number): string {
        var tmp: string = "desconhecido";
        var max: number = Config.busHistorySize;
        if(sum < 0) tmp = sense;
        else if(sum > 0) {
            var tmpSense: string[] = sense.split(" X ");
            var aux: string = tmpSense[1];
            tmpSense[1] = tmpSense[0];
            tmpSense[0] = aux;
            tmp = tmpSense.join(" X ");
        }
        return tmp;
    }
	
    public static identifySense(bus: Bus, startPoint: any): Bus {
        var max: number = Config.busHistorySize;
        var tmp: any = BusUtils.readFromCache(bus.getOrder());
        var finalState: number[] = [];
        
        // Getting the cached information
        var history: any = BusUtils.prepareHistory(tmp, startPoint); 
        startPoint = new Spot(history.startPoint.latitude, history.startPoint.longitude);
        
        // Preparing current position data
        tmp = { latitude: bus.getLatitude(), longitude: bus.getLongitude() };
        
        // Setting the new position
        if(!BusUtils.timelineHasData(tmp, history.timeline)) history.timeline.push(tmp);
        if(history.timeline.length>max) {
            var overpass: number = history.timeline.length - max, i: number = 0;
            while (i++<overpass) history.timeline.shift();
        }
        
        var past: any = null;
        history.timeline.forEach((step, index) => {
            var timelineLength: number = history.timeline.length;
            var tmpState: number = BusUtils.currentPositionState(step, past, startPoint);
            finalState.push(tmpState);
            past = step;
        });
        
        // Getting the current punctuation
        var reducedState: number = BusUtils.reduceState(finalState);
        
        // Updating sense
        var sense: string = BusUtils.prepareSense(bus.getSense(), reducedState);
        bus.setSense(sense);
        
        // Updating the cached data
        BusUtils.writeToCache(bus.getOrder(), history);
        
        return bus;
    }
}
export = BusUtils;