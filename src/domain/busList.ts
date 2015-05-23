class BusList{

    public constructor(private buses: any, private map: any, private length: number){}
	
	public getBuses(): any{
		return this.buses;
	}
	
	public getMap(): any{
		return this.map;
	}
	
	public size(): number{
		return this.length;
	}
}
export = BusList;