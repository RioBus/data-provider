/// <reference path="../defs/node/node.d.ts" />
class Config{
	
	public static log:any = {
		runtime: "./runtime.log",
		server: "./server.log"
	}
	
	public static isProduction(): boolean{
		return (process.argv.indexOf("--production")>-1);
	}
	
	public static errorMailMessage: any = {
		from: "RioBus <error-report@riob.us>",
		to: "",
		subject: "[ERROR] Server down!",
		text: ""
	}
	
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
		},
		mailServer: {
			user: "",
			password: "",
			host: "smtp.gmail.com",
			ssl: true
		}
	}
}

export = Config;