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
        var history: any = (content!=="")? JSON.parse(content) : { startPoint: { latitude: null, longitude: null }, timeline: [], index: 0 };
        if(history.startPoint.latitude===null && history.startPoint.longitude===null && startPoint) history.startPoint = startPoint;
        return history; 
    }
    
    private static timelineHasData(content: any, timeline: any): boolean {
        return timeline.some( (value, index, data) => { return JSON.stringify(data[index])===JSON.stringify(content); });
    }
    
    private static reduceState(states: any): number {
        return states.reduce((prev, cur) => { return prev + cur; })
    }
    
    private static prepareSense(sense: string, sum: number): string {
        var tmp: string = "desconhecido";
        var max: number = Config.busHistorySize;
        if(sum > (max/2)) tmp = sense;
        else if(sum < -(max/2)) {
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
        for(var i=0; i<max; i++) finalState.push(0);
        
        // Getting the cached information
        var history: any = BusUtils.prepareHistory(tmp, startPoint); 
        startPoint = new Spot(history.startPoint.latitude, history.startPoint.longitude);
        
        // Preparing current position data
        tmp = { latitude: bus.getLatitude(), longitude: bus.getLongitude() };
        
        // Getting the current index to insert the new position
        var index: number = history.index;
        
        // Setting the new position
        var dataAlreadyExists: boolean = BusUtils.timelineHasData(tmp, history.timeline);
        if(!dataAlreadyExists) history.timeline[index] = tmp;
        if(bus.getOrder()==="D53660") console.log("current:", tmp);
        if(bus.getOrder()==="D53660") console.log("timeline:", history.timeline);
        
        // Calculating the less recent history state 
        if(bus.getOrder()==="D53660") console.log("index:", index);
        finalState[index] = BusUtils.currentPositionState(history.timeline[index], history.timeline[(index-1)%max], startPoint);
        index = (index+1) % max;
        
        // Calculating the other states
        while(index !== history.index) {
            if(bus.getOrder()==="D53660") console.log("index:", index);
            finalState[index] = BusUtils.currentPositionState(history.timeline[index], history.timeline[(index-1)%max], startPoint);
            index = (index+1) % max;
        }
        
        // Getting the current punctuation
        var sum: number = BusUtils.reduceState(finalState);
        
        // Updating sense
        var sense: string = BusUtils.prepareSense(bus.getSense(), sum);
        bus.setSense(sense);
        
        if(bus.getOrder()==="D53660") {
            console.log("finalState:", finalState);
            console.log("sum:", sum);
            console.log("sense:", sense)
        }
        
        // Updating the index for the next run
        if(!dataAlreadyExists) history.index = (history.index+1)%max;
        
        // Updating the cached data
        BusUtils.writeToCache(bus.getOrder(), history);
        
        return bus;
    }
}
export = BusUtils;