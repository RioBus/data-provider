/**
 * Describes one spot of the Itinerary of a given line
 * @class Itinerary
 * @constructor
 */
class Itinerary{
	
	private sequential: number;
	private line: string;
	private description: string;
	private agency: string;
	private shape: number;
	private latitude: number;
	private longitude: number;

    public constructor(sequential: number, line: string, description: string, 
				agency: string, shape: number, latitude: number, longitude: number){
					
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
	
	public getLine(): string{
		return this.line;
	}
	
	public getDescription(): string{
		return this.description;
	}
	
	public getAgency(): string{
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