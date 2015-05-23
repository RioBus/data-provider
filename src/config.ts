/// <reference path="../defs/node/node.d.ts" />
class Config{
	
	public static log:any = {
		runtime: "./runtime.log",
		server: "./server.log"
	};
	
	public static isProduction(): Boolean{
		return (process.argv.indexOf("--production")>-1);
	};
	
	public static environment: any = {
		provider: {
			host: 			"dadosabertos.rio.rj.gov.br",
			path: {
                bus: 		"/apiTransporte/apresentacao/rest/index.cfm/onibus",
                itinerary: 	"/apiTransporte/Apresentacao/csv/gtfs/onibus/percursos/gtfs_linha$$-shapes.csv",
                output: 	"/tmp/riobus/itinerary"
            },
			updateInterval:	15000,
            timeout: 		20000,
            log: 			"/tmp/riobus/data-server.log",
            dataPath: 		"/tmp/riobus/busData.json"
		}
	};
}

export = Config;