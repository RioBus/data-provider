/**
 * Describes one spot of the Itinerary of a given line
 * @class Itinerary
 * @constructor
 */
class Itinerary{
	
	private sequential: number;
	private line: String;
	private description: String;
	private agency: String;
	private shape: number;
	private latitude: number;
	private longitude: number;

    public constructor(sequential: number, line: String, description: String, 
				agency: String, shape: number, latitude: number, longitude: number){
        "use strict";
        this.sequential = sequential;
        this.line = line;
        this.description = description;
        this.agency = agency;
        this.shape = shape;
        this.latitude = latitude;
        this.longitude = longitude;
    }
	
	public getSequential(): number{
		return this.sequential;
	}
	
	public getLine(): String{
		return this.line;
	}
	
	public getDescription(): String{
		return this.description;
	}
	
	public getAgency(): String{
		return this.agency;
	}
	
	public getShape(): number{
		return this.shape;
	}
	
	public getLatitude(): number{
		return this.latitude;
	}
	
	public getLongitude(): number{
		return this.longitude;
	}
}
export = Itinerary;