/**
 * Describes a bus instance
 * @class Bus
 * @constructor
 */
class Bus{

    public constructor(private line: String, private order: String, private speed: number, 
				private direction: number, private latitude: number, 
				private longitude: number, private timestamp: Date){
    }
	
	public getLine(): String{
		return this.line;
	}
	
	public setLine(line: String): void{
		this.line = line;
	}
	
	public getOrder(): String{
		return this.order;
	}
	
	public getSpeed(): number{
		return this.speed;
	}
	
	public getDirection(): number{
		return this.direction;
	}
	
	public getLatitude(): number{
		return this.latitude;
	}
	
	public getLongitude(): number{
		return this.longitude;
	}
	
	public getUpdateTime(): Date{
		return this.timestamp;
	}
}
export = Bus;